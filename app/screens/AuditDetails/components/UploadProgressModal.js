/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalBody,
    Box,
    VStack,
    HStack,
    Text,
    Progress,
    ProgressFilledTrack,
    Icon,
    Center,
    Spinner,
    Button,
    ButtonText,
} from '@gluestack-ui/themed';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Custom Icon wrapper for MaterialIcons
const MIcon = ({ name, size = 16, color = "#000" }) => (
    <MaterialIcons name={name} size={size} color={color} />
);

// Steps definition
// 1. validating: Gegevens controleren
// 2. photos: Foto's uploaden
// 3. signature: Handtekening versturen
// 4. finishing: Audit afronden

const CheckListItem = ({ activeStep, stepKey, label, subLabel }) => {
    const stepsOrder = ['validating', 'photos', 'signature', 'finishing'];
    const activeIndex = stepsOrder.indexOf(activeStep);
    const myIndex = stepsOrder.indexOf(stepKey);

    let status = 'pending';
    if (myIndex < activeIndex) status = 'done';
    if (myIndex === activeIndex) status = 'current';

    const getBgColor = () => {
        if (status === 'done') return '$green100';
        if (status === 'current') return '$blue100';
        return '$backgroundLight200';
    };

    return (
        <HStack space="md" alignItems="center" h={40}>
            {/* Icon */}
            <Center w="$6" h="$6" borderRadius="$full" bg={getBgColor()}>
                {status === 'done' ? (
                    <MIcon name="check" size={12} color="#16a34a" />
                ) : status === 'current' ? (
                    <Spinner size="small" color="$blue600" />
                ) : (
                    <Box w="$2" h="$2" borderRadius="$full" bg="$backgroundLight400" />
                )}
            </Center>

            {/* Text */}
            <VStack flex={1}>
                <Text
                    fontSize="$sm"
                    fontWeight={status === 'current' ? '$bold' : '$normal'}
                    color={status === 'pending' ? '$textLight400' : '$textDark800'}
                >
                    {label}
                </Text>
                {status === 'current' && subLabel && (
                    <Text fontSize="$xs" color="$blue600">{subLabel}</Text>
                )}
            </VStack>
        </HStack>
    );
};

const UploadProgressModal = ({ visible, uploadState, onRetry, onClose, onFinish }) => {
    const {
        status,
        currentAuditIndex,
        totalAudits,
        auditCode,
        currentStep,
        photoProgress,
        failures,
        successCount = 0,
        failCount = 0
    } = uploadState;

    const isFailed = status === 'failed';
    const isSuccess = status === 'success';

    let headerColor = "#f59e0b";
    let headerTitle = "Audits Uploaden";
    let headerIcon = null;

    if (isFailed) {
        headerColor = "#ef4444";
        headerTitle = "Upload Mislukt";
        headerIcon = "error-outline";
    } else if (isSuccess) {
        headerColor = "#22c55e";
        headerTitle = "Upload Voltooid";
        headerIcon = "check-circle";
    }

    let progress = 0;
    if (currentStep === 'validating') progress = 10;
    if (currentStep === 'photos') {
        const pPercent = photoProgress.total > 0 ? (photoProgress.current / photoProgress.total) * 60 : 0;
        progress = 20 + pPercent;
    }
    if (currentStep === 'signature') progress = 85;
    if (currentStep === 'finishing') progress = 95;

    return (
        <Modal isOpen={visible} onClose={() => { }} size="lg">
            <ModalBackdrop bg="$black" opacity={0.5} />
            <ModalContent maxWidth={400} borderRadius="$2xl">
                <Box bg={headerColor} p="$4" borderTopLeftRadius="$2xl" borderTopRightRadius="$2xl">
                    <HStack alignItems="center" space="sm">
                        {(isFailed || isSuccess) && <MIcon name={headerIcon} size={16} color="#fff" />}
                        <Text color="$white" fontWeight="$bold" fontSize="$md">
                            {headerTitle}
                        </Text>
                    </HStack>
                    {!isFailed && !isSuccess && (
                        <Text color="$white" fontSize="$xs" opacity={0.8}>
                            Sluit de app niet tijdens het uploaden
                        </Text>
                    )}
                </Box>

                <ModalBody pb="$6">
                    {isFailed ? (
                        // ERROR STATE UI
                        <VStack space="md">
                            <Box bg="$red50" p="$3" borderRadius="$xl" borderWidth={1} borderColor="$red100">
                                <VStack space="sm">
                                    <Text color="$red800" fontWeight="$bold">
                                        {failures?.length || 0} Audit(s) niet geüpload
                                    </Text>

                                    <HStack space="sm">
                                        {successCount > 0 && (
                                            <Box bg="$green100" px="$2" py="$0.5" borderRadius="$md" flexDirection="row" alignItems="center">
                                                <MIcon name="check-circle" size={12} color="#16a34a" />
                                                <Text fontSize="$xs" color="$green700" fontWeight="$bold" ml="$1">{successCount} Gelukt</Text>
                                            </Box>
                                        )}
                                        <Box bg="$red100" px="$2" py="$0.5" borderRadius="$md" flexDirection="row" alignItems="center">
                                            <MIcon name="error" size={12} color="#dc2626" />
                                            <Text fontSize="$xs" color="$red700" fontWeight="$bold" ml="$1">{failures?.length || 0} Mislukt</Text>
                                        </Box>
                                    </HStack>

                                    {failures?.map((fail, index) => (
                                        <Box key={index} ml="$2" mt="$2">
                                            <Text color="$red600" fontSize="$xs" fontWeight="$bold">
                                                Audit: {fail.auditCode}
                                            </Text>
                                            <Text color="$red500" fontSize="$xs">
                                                {fail.errorMessage}
                                            </Text>
                                        </Box>
                                    ))}
                                </VStack>
                            </Box>

                            <Text fontSize="$xs" color="$textLight500">
                                Succesvolle audits zijn verwijderd. Mislukte audits zijn veilig opgeslagen.
                            </Text>

                            <HStack space="md" mt="$2">
                                <Button
                                    flex={1}
                                    variant="outline"
                                    action="secondary"
                                    onPress={onClose}
                                    borderRadius="$xl"
                                >
                                    <ButtonText color="$textLight500">Later</ButtonText>
                                </Button>
                                <Button
                                    flex={1}
                                    bg="$amber500"
                                    onPress={onRetry}
                                    borderRadius="$xl"
                                    sx={{ ":active": { bg: "$amber600" } }}
                                >
                                    <ButtonText color="$white">Opnieuw Proberen</ButtonText>
                                </Button>
                            </HStack>
                        </VStack>
                    ) : isSuccess ? (
                        // SUCCESS STATE UI
                        <VStack space="lg" alignItems="center" pt="$4">
                            <Center w="$20" h="$20" bg="$green100" borderRadius="$full">
                                <MIcon name="check-circle" size={48} color="#22c55e" />
                            </Center>

                            <VStack space="xs" alignItems="center">
                                <Text fontSize="$lg" fontWeight="$bold" color="$textDark800">
                                    Alles is gelukt!
                                </Text>
                                <Text fontSize="$sm" color="$textLight500" textAlign="center" px="$4">
                                    Alle {successCount} audits zijn succesvol geüpload en veilig opgeslagen.
                                </Text>
                            </VStack>

                            <Button
                                w="$full"
                                bg="$green500"
                                onPress={onFinish}
                                borderRadius="$xl"
                                mt="$2"
                                sx={{ ":active": { bg: "$green600" } }}
                            >
                                <MIcon name="done" size={16} color="#fff" />
                                <ButtonText color="$white" ml="$1">Klaar</ButtonText>
                            </Button>
                        </VStack>
                    ) : (
                        // PROGRESS STATE UI
                        <VStack space="md">
                            {/* Batch Info */}
                            <HStack justifyContent="space-between" alignItems="center">
                                <VStack>
                                    <Text fontWeight="$bold" color="$textLight600">
                                        Audit {currentAuditIndex} van {totalAudits}
                                    </Text>

                                    <HStack space="sm" mt="$1">
                                        {successCount > 0 && (
                                            <Box bg="$green100" px="$2" py="$0.5" borderRadius="$md" flexDirection="row" alignItems="center">
                                                <MIcon name="check-circle" size={12} color="#16a34a" />
                                                <Text fontSize="$xs" color="$green700" fontWeight="$bold" ml="$1">{successCount} Gelukt</Text>
                                            </Box>
                                        )}
                                        {failCount > 0 && (
                                            <Box bg="$red100" px="$2" py="$0.5" borderRadius="$md" flexDirection="row" alignItems="center">
                                                <MIcon name="error" size={12} color="#dc2626" />
                                                <Text fontSize="$xs" color="$red700" fontWeight="$bold" ml="$1">{failCount} Fout</Text>
                                            </Box>
                                        )}
                                    </HStack>
                                </VStack>

                                <Box bg="$blue100" px="$2" py="$0.5" borderRadius="$md">
                                    <Text fontSize="$xs" color="$blue700" fontWeight="$bold">{auditCode}</Text>
                                </Box>
                            </HStack>

                            <Progress value={progress} size="xs" bg="$backgroundLight200" borderRadius="$full">
                                <ProgressFilledTrack bg="$blue500" />
                            </Progress>

                            <Box bg="$backgroundLight50" p="$3" borderRadius="$xl" borderWidth={1} borderColor="$backgroundLight200">
                                <VStack space="sm">
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
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default UploadProgressModal;
