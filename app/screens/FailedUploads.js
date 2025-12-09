/* eslint-disable react/self-closing-comp */
/* eslint-disable no-alert */
/* eslint-disable prettier/prettier */
import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert } from 'react-native';
import Share from 'react-native-share';
import {
    Box,
    VStack,
    Text,
    Heading,
    Button,
    HStack,
    ScrollView,
    useTheme,
    useColorModeValue,
} from 'native-base';
import RNFS from 'react-native-fs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as database from '../services/database/database1';
import userManager from '../services/UserManager';
import { uploadAuditData, uploadAuditImage } from '../services/api/newAPI';

const FailedUploads = ({ navigation }) => {
    const theme = useTheme();
    const [failedAudits, setFailedAudits] = useState([]);
    const [loading, setLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadFailedAudits();
        }, []),
    );

    const loadFailedAudits = async () => {
        try {
            const audits = await database.getFailedAudits();
            setFailedAudits(audits);
        } catch (error) {
            console.error('Error loading failed audits:', error);
            Alert.alert('Error', 'Kon mislukte audits niet laden');
        }
    };

    // Export naar JSON
    const exportToJSON = async audit => {
        try {
            setLoading(true);

            // Verzamel alle data
            const [forms, elements, signature, clients, images] = await Promise.all([
                database.getAllForms(audit.Id),
                database.getAllElements(audit.Id),
                database.getAuditSignature(audit.AuditCode),
                database.getAllPresentClient(audit.Id),
                database.getErrorsImages(audit.Id),
            ]);

            // Converteer afbeeldingen naar base64
            const imagesBase64 = await Promise.all(
                images.map(async img => {
                    try {
                        const imageUri = img.imageError.Image.replace('file://', '');
                        const imageData = await RNFS.readFile(imageUri, 'base64');
                        return { ...img, imageData };
                    } catch (error) {
                        console.error('Error reading image:', error);
                        return { ...img, imageData: null };
                    }
                }),
            );

            const signatureBase64 = signature
                ? await RNFS.readFile(signature.replace('file://', ''), 'base64')
                : null;

            // Maak export object
            const exportData = {
                meta: {
                    exportDate: new Date().toISOString(),
                    appVersion: '0.0.2',
                    exportReason: 'Upload failed',
                },
                audit: {
                    ...audit,
                    signature: signatureBase64,
                    presentClients: clients,
                    elements: elements,
                },
                forms: forms,
                images: imagesBase64,
            };

            // Schrijf naar file
            const filename = `audit_${audit.AuditCode}_export.json`;
            const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
            await RNFS.writeFile(path, JSON.stringify(exportData, null, 2), 'utf8');

            // Share via iOS/Android Share Sheet
            await Share.open({
                title: `Audit Export - ${audit.AuditCode}`,
                message: `Audit export voor ${audit.AuditCode}\nClient: ${audit.NameClient}`,
                url: `file://${path}`,
                type: 'application/json',
                failOnCancel: false,
            });

            Alert.alert(
                'Export Succesvol',
                `Audit ${audit.AuditCode} geëxporteerd naar:\n${filename}\n\nU kunt dit bestand nu delen via email, WhatsApp, of andere apps.`,
            );

            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error('Export error:', error);
            Alert.alert('Export Error', error.message);
        }
    };

    // Resend via API
    const retryUpload = async audit => {
        try {
            setLoading(true);

            // Herhaal volledige upload flow
            const user = await userManager.getCurrentUser();
            const [forms, elements, signature, clients, images] = await Promise.all([
                database.getAllForms(audit.Id),
                database.getAllElements(audit.Id),
                database.getAuditSignature(audit.AuditCode),
                database.getAllPresentClient(audit.Id),
                database.getErrorsImages(audit.Id),
            ]);

            // Upload images
            const imageResults = [];
            for (const img of images) {
                const response = await uploadAuditImage(
                    user.username,
                    user.password,
                    img.imageError.Image,
                    img.imageError.MimeType,
                );

                if (!response) {
                    throw new Error(`Image upload failed: No ID returned`);
                }

                let logbookImageId = null;
                let technicalAspectsImageId = null;

                if (img.traceImageData.Field === 'logbook') {
                    logbookImageId = response;
                }
                if (img.traceImageData.Field === 'technicalaspects') {
                    technicalAspectsImageId = response;
                }

                imageResults.push({
                    FormId: img.traceImageData.FormId,
                    ElementTypeId: img.traceImageData.ElementTypeId,
                    ErrorTypeId: img.traceImageData.ErrorTypeId,
                    logbookImageId,
                    technicalAspectsImageId,
                });
            }

            // Upload signature
            const signatureId = await uploadAuditImage(
                user.username,
                user.password,
                `file://${signature}`,
                'image/png',
            );

            if (!signatureId) {
                throw new Error(`Signature upload failed: No ID returned`);
            }

            // Build request
            const date = new Date(audit.DateTime);
            const request = {
                audit: {
                    Id: audit.Id,
                    Code: audit.AuditCode,
                    DateTime: date.toISOString(),
                    SignatureImageId: signatureId,
                    PresentClients: clients.map(c => c.name),
                    Elements: elements,
                },
                forms: forms,
            };

            // Add image IDs to errors
            forms.forEach(form => {
                if (form.Errors) {
                    form.Errors.forEach(error => {
                        const imgResult = imageResults.find(
                            r =>
                                r.FormId === form.Id &&
                                r.ElementTypeId === error.ElementTypeId &&
                                r.ErrorTypeId === error.ErrorTypeId,
                        );
                        if (imgResult) {
                            if (imgResult.logbookImageId) {
                                error.LogbookImageId = imgResult.logbookImageId;
                            }
                            if (imgResult.technicalAspectsImageId) {
                                error.TechnicalAspectsImageId =
                                    imgResult.technicalAspectsImageId;
                            }
                        }
                    });
                }
            });

            // Upload audit data
            const response = await uploadAuditData(user.username, user.password, request);

            if (!response) {
                throw new Error("Audit upload failed: No response from server");
            }

            // ✅ Success: verwijder data
            await database.removeAllFromAudit(audit.Id);
            await database.deleteAudit(audit.Id);

            Alert.alert(
                'Upload Succesvol',
                `Audit ${audit.AuditCode} is succesvol geupload!`,
            );
            loadFailedAudits(); // Refresh list
            setLoading(false);
        } catch (error) {
            setLoading(false);

            // Update failed status again
            await database.setAuditUploadStatus(audit.Id, 'failed', error.message);

            Alert.alert('Upload Mislukt', error.message);
            loadFailedAudits(); // Refresh to show updated error
        }
    };

    const cardBackgroundColor = useColorModeValue(
        'gray.100',
        theme.colors.fdis[900],
    );
    const textColor = useColorModeValue('black', 'white');
    const listBackgroundColor = useColorModeValue(
        'white',
        theme.colors.fdis[800],
    );

    return (
        <ScrollView
            flex={1}
            bg={listBackgroundColor}
            p={2}
            _contentContainerStyle={{ paddingBottom: 120 }}>
            <VStack space={3}>
                <Heading size="md" color={textColor}>
                    Mislukte Uploads ({failedAudits.length})
                </Heading>

                {failedAudits.length === 0 ? (
                    <Box bg="green.100" p={4} rounded="md">
                        <Text color="green.700">
                            ✅ Alle audits zijn succesvol geupload!
                        </Text>
                    </Box>
                ) : (
                    failedAudits.map(audit => (
                        <Box
                            key={audit.Id}
                            bg={cardBackgroundColor}
                            p={3}
                            rounded="md"
                            shadow={2}>
                            <VStack space={2}>
                                <HStack justifyContent="space-between">
                                    <VStack>
                                        <Text bold fontSize="md" color={textColor}>
                                            {audit.AuditCode}
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">
                                            {audit.NameClient}
                                        </Text>
                                    </VStack>
                                    <MaterialIcons name="error" size={24} color="red" />
                                </HStack>

                                <Box bg="red.100" p={2} rounded="sm">
                                    <Text fontSize="xs" color="red.700">
                                        {audit.upload_error}
                                    </Text>
                                </Box>

                                <Text fontSize="xs" color="gray.500">
                                    Laatste poging:{' '}
                                    {new Date(audit.last_upload_attempt).toLocaleString('nl-NL')}
                                </Text>

                                <HStack space={2} mt={2}>
                                    <Button
                                        size="sm"
                                        flex={1}
                                        colorScheme="blue"
                                        onPress={() => retryUpload(audit)}
                                        isLoading={loading}
                                        startIcon={
                                            <MaterialIcons name="refresh" size={16} color="white" />
                                        }>
                                        Resend
                                    </Button>

                                    <Button
                                        size="sm"
                                        flex={1}
                                        colorScheme="orange"
                                        variant="outline"
                                        onPress={() => exportToJSON(audit)}
                                        isLoading={loading}
                                        startIcon={
                                            <MaterialIcons name="share" size={16} color="orange" />
                                        }>
                                        Export
                                    </Button>
                                </HStack>
                            </VStack>
                        </Box>
                    ))
                )}
            </VStack>
        </ScrollView>
    );
};

export default FailedUploads;
