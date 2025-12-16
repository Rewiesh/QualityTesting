/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { Modal, Box, VStack, HStack, Text, Progress, Icon, Center, Spinner, Button } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Steps definition
// 1. validating: Gegevens controleren
// 2. photos: Foto's uploaden
// 3. signature: Handtekening versturen
// 4. finishing: Audit afronden

const CheckListItem = ({ activeStep, stepKey, label, subLabel }) => {
    // Determine state based on order
    const stepsOrder = ['validating', 'photos', 'signature', 'finishing'];
    const activeIndex = stepsOrder.indexOf(activeStep);
    const myIndex = stepsOrder.indexOf(stepKey);

    let status = 'pending'; // pending, current, done
    if (myIndex < activeIndex) status = 'done';
    if (myIndex === activeIndex) status = 'current';

    return (
        <HStack space={3} alignItems="center" height={10}>
            {/* Icon */}
            <Center size="6" rounded="full" bg={status === 'done' ? 'green.100' : status === 'current' ? 'blue.100' : 'gray.100'}>
                {status === 'done' ? (
                    <Icon as={MaterialIcons} name="check" size="xs" color="green.600" />
                ) : status === 'current' ? (
                    <Spinner size="sm" color="blue.600" />
                ) : (
                    <Box size="2" rounded="full" bg="gray.300" />
                )}
            </Center>

            {/* Text */}
            <VStack flex={1}>
                <Text fontSize="sm" fontWeight={status === 'current' ? 'bold' : 'normal'} color={status === 'pending' ? 'gray.400' : 'gray.800'}>
                    {label}
                </Text>
                {status === 'current' && subLabel && (
                    <Text fontSize="xs" color="blue.600">{subLabel}</Text>
                )}
            </VStack>
        </HStack>
    );
};

const UploadProgressModal = ({ visible, uploadState, onRetry, onClose, onFinish }) => {
    const {
        status, // 'idle', 'preparing', 'uploading', 'success', 'failed'
        currentAuditIndex,
        totalAudits,
        auditCode,
        currentStep, // 'validating', 'photos', 'signature', 'finishing'
        photoProgress, // { current: 1, total: 5 }
        failures, // Array of failed audits
        successCount = 0,
        failCount = 0
    } = uploadState;

    const isFailed = status === 'failed';
    const isSuccess = status === 'success';

    let headerColor = "fdis.500";
    let headerTitle = "Audits Uploaden";
    let headerIcon = null;

    if (isFailed) {
        headerColor = "red.500";
        headerTitle = "Upload Mislukt";
        headerIcon = "error-outline";
    } else if (isSuccess) {
        headerColor = "green.500";
        headerTitle = "Upload Voltooid";
        headerIcon = "check-circle";
    }

    // Calculate progress for the bar (approximate)
    let progress = 0;
    if (currentStep === 'validating') progress = 10;
    if (currentStep === 'photos') {
        const pPercent = photoProgress.total > 0 ? (photoProgress.current / photoProgress.total) * 60 : 0;
        progress = 20 + pPercent;
    }
    if (currentStep === 'signature') progress = 85;
    if (currentStep === 'finishing') progress = 95;

    return (
        <Modal
            isOpen={visible}
            onClose={() => { }}
            avoidKeyboard
            size="lg"
            _backdrop={{ bg: "black", opacity: 0.5 }}
        >
            <Modal.Content maxWidth="400px" rounded="2xl">
                <Box bg={headerColor} p="4" borderTopRadius="2xl">
                    <HStack alignItems="center" space={2}>
                        {(isFailed || isSuccess) && <Icon as={MaterialIcons} name={headerIcon} size="sm" color="white" />}
                        <Text color="white" fontWeight="bold" fontSize="md">
                            {headerTitle}
                        </Text>
                    </HStack>
                    {!isFailed && !isSuccess && (
                        <Text color="white" fontSize="xs" opacity={0.8}>
                            Sluit de app niet tijdens het uploaden
                        </Text>
                    )}
                </Box>

                <Modal.Body pb="6">
                    {isFailed ? (
                        // ERROR STATE UI
                        <VStack space={4}>
                            <Box bg="red.50" p="3" rounded="xl" borderWidth={1} borderColor="red.100">
                                <VStack space={2}>
                                    <Text color="red.800" fontWeight="bold">
                                        {failures?.length || 0} Audit(s) niet geüpload
                                    </Text>

                                    {/* Status Summary */}
                                    <HStack space={2}>
                                        {successCount > 0 && (
                                            <Box bg="green.100" px="2" py="0.5" rounded="md" flexDirection="row" alignItems="center">
                                                <Icon as={MaterialIcons} name="check-circle" size="xs" color="green.600" mr="1" />
                                                <Text fontSize="xs" color="green.700" fontWeight="bold">{successCount} Gelukt</Text>
                                            </Box>
                                        )}
                                        <Box bg="red.100" px="2" py="0.5" rounded="md" flexDirection="row" alignItems="center">
                                            <Icon as={MaterialIcons} name="error" size="xs" color="red.600" mr="1" />
                                            <Text fontSize="xs" color="red.700" fontWeight="bold">{failures?.length || 0} Mislukt</Text>
                                        </Box>
                                    </HStack>

                                    {failures?.map((fail, index) => (
                                        <Box key={index} ml="2" mt="2">
                                            <Text color="red.600" fontSize="xs" fontWeight="bold">
                                                Audit: {fail.auditCode}
                                            </Text>
                                            <Text color="red.500" fontSize="xs">
                                                {fail.errorMessage}
                                            </Text>
                                        </Box>
                                    ))}
                                </VStack>
                            </Box>

                            <Text fontSize="xs" color="gray.500">
                                Succesvolle audits zijn verwijderd. Mislukte audits zijn veilig opgeslagen.
                            </Text>

                            <HStack space={3} mt="2">
                                <Button
                                    flex={1}
                                    variant="ghost"
                                    onPress={onClose}
                                    _text={{ color: "gray.500" }}
                                    rounded="xl"
                                >
                                    Later
                                </Button>
                                <Button
                                    flex={1}
                                    bg="fdis.500"
                                    onPress={onRetry}
                                    _pressed={{ bg: "fdis.600" }}
                                    rounded="xl"
                                >
                                    Opnieuw Proberen
                                </Button>
                            </HStack>
                        </VStack>
                    ) : isSuccess ? (
                        // SUCCESS STATE UI
                        <VStack space={6} alignItems="center" pt="4">
                            <Center size="20" bg="green.100" rounded="full">
                                <Icon as={MaterialIcons} name="check-circle" size="4xl" color="green.500" />
                            </Center>

                            <VStack space={1} alignItems="center">
                                <Text fontSize="lg" fontWeight="bold" color="gray.800">
                                    Alles is gelukt!
                                </Text>
                                <Text fontSize="sm" color="gray.500" textAlign="center" px="4">
                                    Alle {successCount} audits zijn succesvol geüpload en veilig opgeslagen.
                                </Text>
                            </VStack>

                            <Button
                                w="100%"
                                bg="green.500"
                                onPress={onFinish}
                                _pressed={{ bg: "green.600" }}
                                rounded="xl"
                                mt="2"
                                leftIcon={<Icon as={MaterialIcons} name="done" size="sm" color="white" />}
                            >
                                Klaar
                            </Button>
                        </VStack>
                    ) : (
                        // PROGRESS STATE UI
                        <VStack space={4}>
                            {/* Batch Info */}
                            <HStack justifyContent="space-between" alignItems="center">
                                <VStack>
                                    <Text fontWeight="bold" color="gray.600">
                                        Audit {currentAuditIndex} van {totalAudits}
                                    </Text>

                                    {/* Live Status Row */}
                                    <HStack space={2} mt="1">
                                        {successCount > 0 && (
                                            <Box bg="green.100" px="2" py="0.5" rounded="md" flexDirection="row" alignItems="center">
                                                <Icon as={MaterialIcons} name="check-circle" size="xs" color="green.600" mr="1" />
                                                <Text fontSize="xs" color="green.700" fontWeight="bold">{successCount} Gelukt</Text>
                                            </Box>
                                        )}
                                        {failCount > 0 && (
                                            <Box bg="red.100" px="2" py="0.5" rounded="md" flexDirection="row" alignItems="center">
                                                <Icon as={MaterialIcons} name="error" size="xs" color="red.600" mr="1" />
                                                <Text fontSize="xs" color="red.700" fontWeight="bold">{failCount} Fout</Text>
                                            </Box>
                                        )}
                                    </HStack>
                                </VStack>

                                <Box bg="blue.100" px="2" py="0.5" rounded="md">
                                    <Text fontSize="xs" color="blue.700" fontWeight="bold">{auditCode}</Text>
                                </Box>
                            </HStack>

                            <Progress value={progress} colorScheme="blue" bg="gray.100" size="xs" rounded="full" />

                            <Box bg="gray.50" p="3" rounded="xl" borderWidth={1} borderColor="gray.100">
                                <VStack space={2}>
                                    <CheckListItem
                                        activeStep={currentStep}
                                        stepKey="validating"
                                        label="Gegevens controleren"
                                    />
                                    <CheckListItem
                                        activeStep={currentStep}
                                        stepKey="photos"
                                        label="Foto's uploaden"
                                        subLabel={photoProgress.total > 0 ? `${photoProgress.current} van ${photoProgress.total} geüpload...` : "Voorbereiden..."}
                                    />
                                    <CheckListItem
                                        activeStep={currentStep}
                                        stepKey="signature"
                                        label="Handtekening versturen"
                                    />
                                    <CheckListItem
                                        activeStep={currentStep}
                                        stepKey="finishing"
                                        label="Audit afronden"
                                    />
                                </VStack>
                            </Box>
                        </VStack>
                    )}
                </Modal.Body>
            </Modal.Content>
        </Modal>
    );
};

export default UploadProgressModal;
