/* eslint-disable react/self-closing-comp */
/* eslint-disable no-alert */
/* eslint-disable prettier/prettier */
import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, Platform } from 'react-native';
import Share from 'react-native-share';
import {
    Box,
    VStack,
    Text,
    Button,
    HStack,
    ScrollView,
    useColorModeValue,
    Center,
    Icon,
    Pressable,
    Modal,
} from 'native-base';
import RNFS from 'react-native-fs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as database from '../services/database/database1';
import userManager from '../services/UserManager';
import { uploadAuditData, uploadAuditImage } from '../services/api/newAPI';

const FailedUploads = ({ navigation }) => {
    const [failedAudits, setFailedAudits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    // Modern UI Colors
    const bgMain = useColorModeValue('coolGray.100', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');

    useFocusEffect(
        useCallback(() => {
            loadFailedAudits();
        }, []),
    );

    // Header Button for Help
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Pressable onPress={() => setShowInfo(prev => !prev)} p="2" mr="2">
                    <Icon
                        as={MaterialIcons}
                        name="help-outline"
                        size="md"
                        color="white"
                    />
                </Pressable>
            ),
        });
    }, [navigation]);

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
            const [forms, elements, signature, clients, images, user] = await Promise.all([
                database.getAllForms(audit.Id),
                database.getAllElements(audit.Id),
                database.getAuditSignature(audit.AuditCode),
                database.getAllPresentClient(audit.Id),
                database.getErrorsImages(audit.Id),
                userManager.getCurrentUser(),
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
                user: {
                    username: user?.username || 'unknown',
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
            // const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
            const path = Platform.select({
                ios: `${RNFS.DocumentDirectoryPath}/${filename}`,
                android: `${RNFS.CachesDirectoryPath}/${filename}`, // Android werkt beter met CachesDirectory
            });
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

                if (!response || response.error) {
                    throw new Error(response?.error || `Image upload failed: No ID returned`);
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

            if (!signatureId || signatureId.error) {
                throw new Error(signatureId?.error || `Signature upload failed: No ID returned`);
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

            if (!response || response.error) {
                throw new Error(response?.error || "Audit upload failed: No response from server");
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

    const handleDelete = async audit => {
        Alert.alert(
            'Audit Verwijderen',
            `Weet u zeker dat u audit ${audit.AuditCode} wilt verwijderen?\n\nZorg ervoor dat u deze audit eerst heeft geëxporteerd indien nodig!`,
            [
                {
                    text: 'Annuleren',
                    style: 'cancel',
                },
                {
                    text: 'Verwijderen',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await database.removeAllFromAudit(audit.Id);
                            await database.deleteAudit(audit.Id);
                            loadFailedAudits();
                            setLoading(false);
                        } catch (error) {
                            setLoading(false);
                            console.error('Delete error:', error);
                            Alert.alert('Error', 'Kon audit niet verwijderen');
                        }
                    },
                },
            ],
        );
    };

    // Help Modal
    const renderHelpModal = () => (
        <Modal isOpen={showInfo} onClose={() => setShowInfo(false)} size="lg">
            <Modal.Content maxWidth="400px" rounded="2xl">
                <Modal.CloseButton />
                <Modal.Header borderBottomWidth={0} _text={{ fontWeight: 'bold', fontSize: 'md' }}>
                    Handleiding Mislukte Uploads
                </Modal.Header>
                <Modal.Body pt={0}>
                    <VStack space={4}>
                        <Text fontSize="sm" color="coolGray.600">
                            In dit overzicht ziet u de audits die nog niet naar de data server zijn verzonden. Dit gebeurt meestal door een tijdelijke of slechte internetverbinding.
                        </Text>

                        <Box bg="blue.50" p="3" rounded="xl">
                            <Text fontWeight="bold" color="blue.700" mb="2">Betekenis van de knoppen</Text>

                            <HStack space={3} mb="3" alignItems="flex-start">
                                <Center bg="fdis.500" size="6" rounded="full" mt="1">
                                    <Icon as={MaterialIcons} name="refresh" size="xs" color="white" />
                                </Center>
                                <VStack flex={1}>
                                    <Text fontSize="sm" fontWeight="bold">Opnieuw</Text>
                                    <Text fontSize="xs" color="coolGray.600">
                                        Probeer de audit opnieuw te uploaden. Zorg ervoor dat u beschikt over een stabiele internetverbinding (bij voorkeur wifi of 4G/5G).
                                    </Text>
                                </VStack>
                            </HStack>

                            <HStack space={3} mb="3" alignItems="flex-start">
                                <Center bg="orange.100" size="6" rounded="full" mt="1">
                                    <Icon as={MaterialIcons} name="share" size="xs" color="orange.500" />
                                </Center>
                                <VStack flex={1}>
                                    <Text fontSize="sm" fontWeight="bold">Exporteren</Text>
                                    <Text fontSize="xs" color="coolGray.600">
                                        Maak een bestand aan om de audit handmatig te delen, bijvoorbeeld via e-mail of WhatsApp. Gebruik deze optie wanneer uploaden niet mogelijk is.
                                    </Text>
                                </VStack>
                            </HStack>

                            <HStack space={3} alignItems="flex-start">
                                <Center bg="red.100" size="6" rounded="full" mt="1">
                                    <Icon as={MaterialIcons} name="delete-outline" size="xs" color="red.500" />
                                </Center>
                                <VStack flex={1}>
                                    <Text fontSize="sm" fontWeight="bold">Verwijderen</Text>
                                    <Text fontSize="xs" color="coolGray.600">
                                        Verwijder de audit van dit apparaat. Let op: deze actie is definitief en kan niet ongedaan worden gemaakt.
                                    </Text>
                                </VStack>
                            </HStack>
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="bold" color="coolGray.700" mb="1">Advies:</Text>
                            <Text fontSize="xs" color="coolGray.500" mb="2">
                                Probeer altijd eerst de optie ‘Opnieuw’ met een goede internetverbinding. Gebruik ‘Exporteren’ alleen als noodoplossing wanneer uploaden niet lukt.
                            </Text>
                            <Text fontSize="xs" color="coolGray.500">
                                Heeft u de audit geëxporteerd en is deze succesvol geïmporteerd in de data-applicatie? Verwijder de audit daarna van dit apparaat om opslagruimte vrij te houden.
                            </Text>
                        </Box>
                    </VStack>
                </Modal.Body>
                <Modal.Footer bg="coolGray.50" borderTopWidth={0}>
                    <Button
                        flex={1}
                        onPress={() => setShowInfo(false)}
                        bg="fdis.500"
                        rounded="xl"
                        _text={{ fontWeight: 'bold' }}
                    >
                        Begrepen
                    </Button>
                </Modal.Footer>
            </Modal.Content>
        </Modal>
    );

    // Section Header
    const renderHeader = () => (
        <Box px="4" pt="4" pb="2">
            <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="xs" fontWeight="bold" color="gray.500" letterSpacing="lg">
                    MISLUKTE UPLOADS
                </Text>
                <Box bg={failedAudits.length > 0 ? "red.100" : "green.100"} px="3" py="1" rounded="full">
                    <Text fontSize="xs" fontWeight="bold" color={failedAudits.length > 0 ? "red.600" : "green.600"}>
                        {failedAudits.length} items
                    </Text>
                </Box>
            </HStack>
        </Box>
    );

    // Empty State
    const renderEmptyState = () => (
        <Center flex={1} py="20">
            <VStack alignItems="center" space={4}>
                <Center bg="green.100" size="20" rounded="full">
                    <Icon as={MaterialIcons} name="check-circle" size="4xl" color="green.500" />
                </Center>
                <VStack alignItems="center" space={1}>
                    <Text fontSize="lg" fontWeight="bold" color="coolGray.800">
                        Alles Gesynchroniseerd!
                    </Text>
                    <Text fontSize="sm" color="coolGray.500" textAlign="center" px="8">
                        Alle audits zijn succesvol geupload naar de server.
                    </Text>
                </VStack>
            </VStack>
        </Center>
    );

    // Failed Audit Card
    const renderAuditCard = (audit) => (
        <Box
            key={audit.Id}
            bg={cardBg}
            mx="4"
            my="2"
            rounded="2xl"
            shadow={2}
            overflow="hidden"
        >
            {/* Card Header with Error Icon */}
            <HStack bg="red.50" px="4" py="3" alignItems="center" justifyContent="space-between">
                <HStack alignItems="center" space={3}>
                    <Center bg="red.100" size="10" rounded="full">
                        <Icon as={MaterialIcons} name="error-outline" size="md" color="red.600" />
                    </Center>
                    <VStack>
                        <Text fontSize="md" fontWeight="bold" color="coolGray.800">
                            {audit.AuditCode}
                        </Text>
                        <Text fontSize="xs" color="coolGray.500">
                            {audit.NameClient}
                        </Text>
                    </VStack>
                </HStack>
                <Icon as={MaterialIcons} name="chevron-right" size="sm" color="coolGray.300" />
            </HStack>

            {/* Error Message */}
            <Box px="4" py="3">
                <Box bg="red.50" p="3" rounded="xl">
                    <HStack space={2} alignItems="flex-start">
                        <Icon as={MaterialIcons} name="info" size="xs" color="red.500" mt="0.5" />
                        <Text fontSize="xs" color="red.700" flex={1}>
                            {audit.upload_error}
                        </Text>
                    </HStack>
                </Box>

                {/* Timestamp */}
                <HStack alignItems="center" space={1} mt="3">
                    <Icon as={MaterialIcons} name="schedule" size="xs" color="coolGray.400" />
                    <Text fontSize="xs" color="coolGray.400">
                        Laatste poging: {new Date(audit.last_upload_attempt).toLocaleString('nl-NL')}
                    </Text>
                </HStack>
            </Box>

            {/* Action Buttons */}
            <HStack px="4" pb="4" space={2}>
                <Button
                    flex={1}
                    size="sm"
                    bg="fdis.500"
                    _pressed={{ bg: "fdis.600" }}
                    rounded="xl"
                    onPress={() => retryUpload(audit)}
                    isLoading={loading}
                    leftIcon={<Icon as={MaterialIcons} name="refresh" size="sm" color="white" />}
                >
                    Opnieuw
                </Button>

                <Button
                    flex={1}
                    size="sm"
                    variant="outline"
                    borderColor="orange.400"
                    _text={{ color: "orange.500" }}
                    _pressed={{ bg: "orange.50" }}
                    rounded="xl"
                    onPress={() => exportToJSON(audit)}
                    isLoading={loading}
                    leftIcon={<Icon as={MaterialIcons} name="share" size="sm" color="orange.500" />}
                >
                    Export
                </Button>

                <Pressable onPress={() => handleDelete(audit)}>
                    {({ isPressed }) => (
                        <Center
                            bg={isPressed ? "red.100" : "red.50"}
                            size="10"
                            rounded="xl"
                            style={{ transform: [{ scale: isPressed ? 0.95 : 1 }] }}
                        >
                            <Icon as={MaterialIcons} name="delete-outline" size="md" color="red.500" />
                        </Center>
                    )}
                </Pressable>
            </HStack>
        </Box>
    );

    return (
        <ScrollView
            flex={1}
            bg={bgMain}
            _contentContainerStyle={{
                flexGrow: 1,
                paddingBottom: 120
            }}
        >
            {renderHelpModal()}
            {renderHeader()}

            {failedAudits.length === 0 ? (
                renderEmptyState()
            ) : (
                <VStack>
                    {failedAudits.map(audit => renderAuditCard(audit))}
                </VStack>
            )}
        </ScrollView>
    );
};

export default FailedUploads;
