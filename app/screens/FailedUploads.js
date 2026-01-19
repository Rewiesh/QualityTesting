/* eslint-disable react/self-closing-comp */
/* eslint-disable no-alert */
/* eslint-disable prettier/prettier */
import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, Platform, ScrollView as RNScrollView } from 'react-native';
import Share from 'react-native-share';
import {
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Box,
    VStack,
    Text,
    Button,
    ButtonText,
    ButtonSpinner,
    HStack,
    Center,
    Pressable,
    Icon,
    CloseIcon,
} from '@gluestack-ui/themed';
import RNFS from 'react-native-fs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as database from '../services/database/database1';
import userManager from '../services/UserManager';
import { uploadAuditData, uploadAuditImage } from '../services/api/newAPI';

// Custom Icon wrapper for MaterialIcons
const MIcon = ({ name, size = 16, color = "#000" }) => (
    <MaterialIcons name={name} size={size} color={color} />
);

const FailedUploads = ({ navigation }) => {
    const [failedAudits, setFailedAudits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadFailedAudits();
        }, []),
    );

    // Header Button for Help
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Pressable onPress={() => setShowInfo(prev => !prev)} p="$2" mr="$2">
                    <MIcon name="help-outline" size={20} color="#fff" />
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
                    appVersion: '1.4.0',
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
            const path = Platform.select({
                ios: `${RNFS.DocumentDirectoryPath}/${filename}`,
                android: `${RNFS.CachesDirectoryPath}/${filename}`,
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
            <ModalBackdrop />
            <ModalContent maxWidth={400} borderRadius="$2xl">
                <ModalCloseButton>
                    <Icon as={CloseIcon} />
                </ModalCloseButton>
                <ModalHeader borderBottomWidth={0}>
                    <Text fontWeight="$bold" fontSize="$md">Handleiding Mislukte Uploads</Text>
                </ModalHeader>
                <ModalBody pt="$0">
                    <VStack space="md">
                        <Text fontSize="$sm" color="$textLight600">
                            In dit overzicht ziet u de audits die nog niet naar de data server zijn verzonden. Dit gebeurt meestal door een tijdelijke of slechte internetverbinding.
                        </Text>

                        <Box bg="$blue50" p="$3" borderRadius="$xl">
                            <Text fontWeight="$bold" color="$blue700" mb="$2">Betekenis van de knoppen</Text>

                            <HStack space="md" mb="$3" alignItems="flex-start">
                                <Center bg="$amber500" w="$6" h="$6" borderRadius="$full" mt="$1">
                                    <MIcon name="refresh" size={12} color="#fff" />
                                </Center>
                                <VStack flex={1}>
                                    <Text fontSize="$sm" fontWeight="$bold">Opnieuw</Text>
                                    <Text fontSize="$xs" color="$textLight600">
                                        Probeer de audit opnieuw te uploaden. Zorg ervoor dat u beschikt over een stabiele internetverbinding (bij voorkeur wifi of 4G/5G).
                                    </Text>
                                </VStack>
                            </HStack>

                            <HStack space="md" mb="$3" alignItems="flex-start">
                                <Center bg="$orange100" w="$6" h="$6" borderRadius="$full" mt="$1">
                                    <MIcon name="share" size={12} color="#f97316" />
                                </Center>
                                <VStack flex={1}>
                                    <Text fontSize="$sm" fontWeight="$bold">Exporteren</Text>
                                    <Text fontSize="$xs" color="$textLight600">
                                        Maak een bestand aan om de audit handmatig te delen, bijvoorbeeld via e-mail of WhatsApp. Gebruik deze optie wanneer uploaden niet mogelijk is.
                                    </Text>
                                </VStack>
                            </HStack>

                            <HStack space="md" alignItems="flex-start">
                                <Center bg="$red100" w="$6" h="$6" borderRadius="$full" mt="$1">
                                    <MIcon name="delete-outline" size={12} color="#ef4444" />
                                </Center>
                                <VStack flex={1}>
                                    <Text fontSize="$sm" fontWeight="$bold">Verwijderen</Text>
                                    <Text fontSize="$xs" color="$textLight600">
                                        Verwijder de audit van dit apparaat. Let op: deze actie is definitief en kan niet ongedaan worden gemaakt.
                                    </Text>
                                </VStack>
                            </HStack>
                        </Box>

                        <Box>
                            <Text fontSize="$sm" fontWeight="$bold" color="$textDark700" mb="$1">Advies:</Text>
                            <Text fontSize="$xs" color="$textLight500" mb="$2">
                                Probeer altijd eerst de optie 'Opnieuw' met een goede internetverbinding. Gebruik 'Exporteren' alleen als noodoplossing wanneer uploaden niet lukt.
                            </Text>
                            <Text fontSize="$xs" color="$textLight500">
                                Heeft u de audit geëxporteerd en is deze succesvol geïmporteerd in de data-applicatie? Verwijder de audit daarna van dit apparaat om opslagruimte vrij te houden.
                            </Text>
                        </Box>
                    </VStack>
                </ModalBody>
                <ModalFooter bg="$backgroundLight100" borderTopWidth={0}>
                    <Button
                        flex={1}
                        onPress={() => setShowInfo(false)}
                        bg="$amber500"
                        borderRadius="$xl"
                        sx={{ ":active": { bg: "$amber600" } }}
                    >
                        <ButtonText fontWeight="$bold" color="$white">Begrepen</ButtonText>
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );

    // Section Header
    const renderHeader = () => (
        <Box px="$4" pt="$4" pb="$2">
            <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="$xs" fontWeight="$bold" color="$textLight500" letterSpacing="$lg">
                    MISLUKTE UPLOADS
                </Text>
                <Box bg={failedAudits.length > 0 ? "$red100" : "$green100"} px="$3" py="$1" borderRadius="$full">
                    <Text fontSize="$xs" fontWeight="$bold" color={failedAudits.length > 0 ? "$red600" : "$green600"}>
                        {failedAudits.length} items
                    </Text>
                </Box>
            </HStack>
        </Box>
    );

    // Empty State
    const renderEmptyState = () => (
        <Center flex={1} py="$20">
            <VStack alignItems="center" space="md">
                <Center bg="$green100" w="$20" h="$20" borderRadius="$full">
                    <MIcon name="check-circle" size={48} color="#22c55e" />
                </Center>
                <VStack alignItems="center" space="xs">
                    <Text fontSize="$lg" fontWeight="$bold" color="$textDark800">
                        Alles Gesynchroniseerd!
                    </Text>
                    <Text fontSize="$sm" color="$textLight500" textAlign="center" px="$8">
                        Alle audits zijn succesvol geupload naar de server.
                    </Text>
                </VStack>
            </VStack>
        </Center>
    );

    // Failed Audit Card
    const renderAuditCard = (audit) => {
        const [delPressed, setDelPressed] = useState(false);

        return (
            <Box
                key={audit.Id}
                bg="$white"
                mx="$4"
                my="$2"
                borderRadius="$2xl"
                shadowColor="$black"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.1}
                shadowRadius={4}
                overflow="hidden"
            >
                {/* Card Header with Error Icon */}
                <HStack bg="$red50" px="$4" py="$3" alignItems="center" justifyContent="space-between">
                    <HStack alignItems="center" space="md">
                        <Center bg="$red100" w="$10" h="$10" borderRadius="$full">
                            <MIcon name="error-outline" size={20} color="#dc2626" />
                        </Center>
                        <VStack>
                            <Text fontSize="$md" fontWeight="$bold" color="$textDark800">
                                {audit.AuditCode}
                            </Text>
                            <Text fontSize="$xs" color="$textLight500">
                                {audit.NameClient}
                            </Text>
                        </VStack>
                    </HStack>
                    <MIcon name="chevron-right" size={16} color="#d1d5db" />
                </HStack>

                {/* Error Message */}
                <Box px="$4" py="$3">
                    <Box bg="$red50" p="$3" borderRadius="$xl">
                        <HStack space="sm" alignItems="flex-start">
                            <MIcon name="info" size={12} color="#ef4444" style={{ marginTop: 2 }} />
                            <Text fontSize="$xs" color="$red700" flex={1}>
                                {audit.upload_error}
                            </Text>
                        </HStack>
                    </Box>

                    {/* Timestamp */}
                    <HStack alignItems="center" space="xs" mt="$3">
                        <MIcon name="schedule" size={12} color="#9ca3af" />
                        <Text fontSize="$xs" color="$textLight400">
                            Laatste poging: {new Date(audit.last_upload_attempt).toLocaleString('nl-NL')}
                        </Text>
                    </HStack>
                </Box>

                {/* Action Buttons */}
                <HStack px="$4" pb="$4" space="sm">
                    <Button
                        flex={1}
                        size="sm"
                        bg="$amber500"
                        borderRadius="$xl"
                        sx={{ ":active": { bg: "$amber600" } }}
                        onPress={() => retryUpload(audit)}
                        isDisabled={loading}
                    >
                        {loading ? (
                            <ButtonSpinner color="$white" />
                        ) : (
                            <>
                                <MIcon name="refresh" size={16} color="#fff" />
                                <ButtonText color="$white" ml="$1">Opnieuw</ButtonText>
                            </>
                        )}
                    </Button>

                    <Button
                        flex={1}
                        size="sm"
                        variant="outline"
                        borderColor="$orange400"
                        borderRadius="$xl"
                        onPress={() => exportToJSON(audit)}
                        isDisabled={loading}
                    >
                        <MIcon name="share" size={16} color="#f97316" />
                        <ButtonText color="$orange500" ml="$1">Export</ButtonText>
                    </Button>

                    <Pressable
                        onPress={() => handleDelete(audit)}
                        onPressIn={() => setDelPressed(true)}
                        onPressOut={() => setDelPressed(false)}
                    >
                        <Center
                            bg={delPressed ? "$red100" : "$red50"}
                            w="$10"
                            h="$10"
                            borderRadius="$xl"
                            style={{ transform: [{ scale: delPressed ? 0.95 : 1 }] }}
                        >
                            <MIcon name="delete-outline" size={20} color="#ef4444" />
                        </Center>
                    </Pressable>
                </HStack>
            </Box>
        );
    };

    return (
        <RNScrollView
            style={{ flex: 1, backgroundColor: '#f3f4f6' }}
            contentContainerStyle={{
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
        </RNScrollView>
    );
};

export default FailedUploads;
