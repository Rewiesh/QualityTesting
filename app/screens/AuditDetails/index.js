/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable react/self-closing-comp */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-alert */
/* eslint-disable no-trailing-spaces */
/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Box,
  VStack,
  Text,
  Center,
  Spinner,
  Button,
  ButtonText,
  HStack,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  Pressable,
  CloseIcon,
  Icon,
} from "@gluestack-ui/themed";
import { ScrollView } from "react-native";

// Custom Icon wrapper
const MIcon = ({ name, size = 16, color = "#000" }) => (
  <MaterialIcons name={name} size={size} color={color} />
);

// FDIS theme color
const FDIS_COLOR = '#f59e0b';
import { StyleSheet, TextInput } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import RNFS from "react-native-fs";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { uploadAuditData, uploadAuditImage } from "../../services/api/newAPI";
import * as database from "../../services/database/database1";
import userManager from "../../services/UserManager";

// Import refactored components
import {
  AuditInfoSection,
  CategoriesSection,
  KpiSection,
  SignatureSection,
  UploadModal,
  UploadErrorDialog,
  UploadProgressModal,
} from "./components";

const AuditDetails = ({ route, navigation }) => {
  const scrollViewRef = useRef();
  const signatureRef = useRef(null);
  const isFocused = useIsFocused();

  const { AuditId, clientName, user } = route.params;

  // State
  const [loading, setLoading] = useState(true); // Start with loading true for initial load
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [loadingText, setLoadingText] = useState("Gegevens worden geladen");
  const [audit, setAudit] = useState({});
  const [categories, setCategories] = useState([]);
  const [signature, setSignature] = useState(null);
  const [kpiElements, setKpiElements] = useState([]);
  const [signatureSaved, setSignatureSaved] = useState(false);
  const [ready, setReady] = useState(false);
  const [remarkModalVisible, setRemarkModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  const [uploadErrorDialogVisible, setUploadErrorDialogVisible] = useState(false);
  const [uploadErrorInfo, setUploadErrorInfo] = useState({});
  const [currentKPI, setCurrentKPI] = useState({});
  const [remark, setRemark] = useState("");
  const [formsCount, setFormsCount] = useState(0);

  // Smart Upload State
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [uploadState, setUploadState] = useState({
    status: 'idle',
    currentAuditIndex: 0,
    totalAudits: 0,
    auditCode: '',
    currentStep: 'validating', // validating, photos, signature, finishing
    photoProgress: { current: 0, total: 0 }
  });

  // Modern UI Colors
  const bgMain = '$backgroundLight100';
  const cardBg = '$white';
  const headingTextColor = '$textDark800';
  const textColor = '$textDark800';
  const refreshingIndicatorColor = FDIS_COLOR;
  const btnColor = FDIS_COLOR;

  // Fetch data on focus
  useEffect(() => {
    if (isFocused) {
      renderAddPersonButton();
      fetchAuditData();
    }
  }, [isFocused, AuditId]);

  const fetchAuditData = useCallback(async () => {
    // Only show loading spinner on initial load, not on subsequent refreshes
    if (!initialLoadDone) {
      setLoading(true);
    }
    try {
      const auditData = await database.getAuditById(AuditId);
      setAudit(auditData);

      const [categoriesData, counters, signatureData] = await Promise.all([
        database.getTotalCounterElementByCategory(auditData.NameClient, auditData.LocationSize),
        database.getAuditCounterElements(auditData.Id),
        database.getAuditSignature(auditData.AuditCode),
      ]);

      const mergedCategories = categoriesData.map(cat => {
        const counter = counters.find(c => c.CategoryId === cat.Id) || { CounterElements: 0 };
        return { ...cat, CounterElements: counter.CounterElements };
      });

      setCategories(mergedCategories);
      setSignature(signatureData);

      if (signatureData) {
        setSignatureSaved(true);
        setReady(true);
      }

      const [elements, forms] = await Promise.all([
        database.getAllElements(AuditId),
        database.getFormsByAuditId(AuditId),
      ]);
      setKpiElements(elements);
      setFormsCount(forms.length);
    } catch (error) {
      console.error("Error fetching audit data:", error);
      // Only show alert on initial load failure
      if (!initialLoadDone) {
        alert("Fout bij laden: " + error.message);
      }
    } finally {
      setLoading(false);
      setInitialLoadDone(true);
    }
  }, [AuditId, initialLoadDone]);

  // Signature handlers
  const handleSignature = useCallback(async (sig) => {
    setSignature(sig);
    try {
      const base64Signature = sig.replace(/^data:image\/png;base64,/, "");
      const filename = `signature_${audit.AuditCode}.png`;
      const path = `file://${RNFS.DocumentDirectoryPath}/${filename}`;

      await RNFS.writeFile(path, base64Signature, "base64");
      await database.upsertSignature(audit.AuditCode, path);

      setSignatureSaved(true);
      setReady(true);
    } catch (error) {
      console.error("Error saving signature:", error);
    }
  }, [audit.AuditCode]);

  const handleClearSignature = useCallback(async () => {
    if (signatureRef.current) {
      signatureRef.current.clearSignature();
    }
    if (signature && audit?.AuditCode) {
      try {
        await database.deleteAuditSignature(audit.AuditCode);
      } catch (error) {
        console.error("Error deleting signature:", error);
      }
    }
    setSignature(null);
    setSignatureSaved(false);
    setReady(false);
  }, [signature, audit?.AuditCode]);

  const saveSignature = useCallback(() => {
    signatureRef.current?.readSignature();
  }, []);

  const disableScroll = useCallback(() => {
    scrollViewRef.current?.setNativeProps({ scrollEnabled: false });
  }, []);

  const enableScroll = useCallback(() => {
    scrollViewRef.current?.setNativeProps({ scrollEnabled: true });
  }, []);

  // KPI handlers
  const handleKpiValueChange = useCallback((kpi, elements_auditId, newValue) => {
    database.setKpiElementValue(elements_auditId, newValue);
    setKpiElements(prev =>
      prev.map(k => k.elements_auditId === elements_auditId ? { ...k, ElementValue: newValue } : k)
    );
    if (newValue === "O") {
      setCurrentKPI(kpi);
      setRemark(kpi.ElementComment);
      setRemarkModalVisible(true);
    }
  }, []);

  const openRemarkModal = useCallback((kpi) => {
    setCurrentKPI(kpi);
    setRemark(kpi.ElementComment);
    setRemarkModalVisible(true);
  }, []);

  const saveRemark = useCallback((newRemark) => {
    database.setKpiElementComment(currentKPI.elements_auditId, newRemark);
    setKpiElements(prev =>
      prev.map(k => k.elements_auditId === currentKPI.elements_auditId ? { ...k, ElementComment: newRemark } : k)
    );
    setRemarkModalVisible(false);
  }, [currentKPI]);

  // Upload logic
  const isUploadReady = useMemo(() => ready && signatureSaved, [ready, signatureSaved]);

  const handleUpload = useCallback(() => {
    const hasIncomplete = categories.some(cat =>
      parseInt(cat.CounterElements, 10) < parseInt(cat.Min, 10)
    );
    if (hasIncomplete) {
      setUploadModalVisible(true);
    } else {
      getFormsToSubmit();
    }
  }, [categories]);

  const getFormsToSubmit = async () => {
    try {
      setUploadModalVisible(false);
      // Don't use global Spinner anymore, use Smart Modal
      setShowProgressModal(true);

      const allReadyAudits = await database.getCompletedAudits();
      const totalAudits = allReadyAudits.length;

      // Init State
      setUploadState({
        status: 'preparing',
        currentAuditIndex: 0,
        totalAudits: totalAudits,
        auditCode: '...',
        currentStep: 'validating',
        photoProgress: { current: 0, total: 0 },
        successCount: 0,
        failCount: 0
      });

      const failedAudits = [];

      for (let i = 0; i < allReadyAudits.length; i++) {
        const uploadAuditId = allReadyAudits[i].Id;
        const uploadAuditCode = allReadyAudits[i].AuditCode;

        // Update State: New Audit Started (Preserve counts)
        setUploadState(prev => ({
          ...prev,
          status: 'uploading',
          currentAuditIndex: i + 1,
          auditCode: uploadAuditCode,
          currentStep: 'validating',
          photoProgress: { current: 0, total: 0 }
        }));

        try {
          await database.setAuditUploadStatus(uploadAuditId, 'uploading', null);

          // 1. Validating done, move to Photos
          setUploadState(prev => ({ ...prev, currentStep: 'photos' }));

          // Upload images with progress callback
          const uploadResults = await uploadImagesWithProgress(uploadAuditId, uploadAuditCode, (current, total) => {
            setUploadState(prev => ({
              ...prev,
              photoProgress: { current, total }
            }));
          });

          // 2. Photos done, move to Signature
          setUploadState(prev => ({ ...prev, currentStep: 'signature' }));

          // Get all data
          const [currentUser, forms, auditElements, auditSignature, dateString, clients] = await Promise.all([
            userManager.getCurrentUser(),
            database.getAllForms(uploadAuditId),
            database.getAllElements(uploadAuditId),
            database.getAuditSignature(uploadAuditCode),
            database.getAuditDate(uploadAuditId),
            database.getAllPresentClient(uploadAuditId),
          ]);

          // Upload signature
          const signatureId = await uploadAuditImage(
            currentUser.username,
            currentUser.password,
            `file://${auditSignature}`,
            "image/png"
          );

          if (!signatureId || signatureId.error) {
            throw new Error(signatureId?.error || "Signature upload failed");
          }

          // 3. Signature done, move to Finishing
          setUploadState(prev => ({ ...prev, currentStep: 'finishing' }));

          // Build request
          const date = new Date(dateString);
          const request = {
            audit: {
              Id: uploadAuditId,
              Code: uploadAuditCode,
              DateTime: date.toISOString(),
              SignatureImageId: signatureId,
              PresentClients: clients.map(c => c.name),
              Elements: auditElements,
            },
            forms: forms,
          };

          // Add image IDs to errors
          if (uploadResults) {
            forms.forEach(form => {
              form.Errors?.forEach(error => {
                const imgResults = uploadResults.filter(r =>
                  r.FormId === form.Id && r.ElementTypeId === error.ElementTypeId && r.ErrorTypeId === error.ErrorTypeId
                );

                imgResults.forEach(imgResult => {
                  if (imgResult.logbookImageId) error.LogbookImageId = imgResult.logbookImageId;
                  if (imgResult.technicalAspectsImageId) error.TechnicalAspectsImageId = imgResult.technicalAspectsImageId;
                });
              });
            });
          }

          // Upload audit
          const response = await uploadAuditData(currentUser.username, currentUser.password, request);

          if (!response || response.error) {
            throw new Error(response?.error || "Upload failed");
          }

          // Success - cleanup
          await database.removeAllFromAudit(uploadAuditId);
          await database.deleteAudit(uploadAuditId);

          // Highlight Success
          setUploadState(prev => ({ ...prev, successCount: prev.successCount + 1 }));

        } catch (error) {
          console.error(`Upload failed for ${uploadAuditCode}:`, error);
          await database.setAuditUploadStatus(uploadAuditId, 'failed', error.message);
          failedAudits.push({ auditCode: uploadAuditCode, auditId: uploadAuditId, errorMessage: error.message });

          // Highlight Failure
          setUploadState(prev => ({ ...prev, failCount: prev.failCount + 1 }));
        }
      }

      if (failedAudits.length > 0) {
        // Switch Modal to Error State (Don't close it)
        setUploadState(prev => ({
          ...prev,
          status: 'failed',
          failures: failedAudits
        }));
      } else {
        // Success State (Wait for user to click "Klaar")
        setUploadState(prev => ({
          ...prev,
          status: 'success'
        }));
      }
    } catch (error) {
      // Global error (should be rare)
      setShowProgressModal(false);
      console.error(error);
      alert(error.message);
    }
  };

  const uploadImagesWithProgress = async (auditId, auditCode, onProgress) => {
    try {
      const currentUser = await userManager.getCurrentUser();
      const errorImages = await database.getErrorsImages(auditId);
      const results = [];
      const total = errorImages.length;

      // Init progress
      onProgress(0, total);

      for (let i = 0; i < total; i++) {
        const item = errorImages[i];

        // Update progress before start
        onProgress(i + 1, total);

        const response = await uploadAuditImage(
          currentUser.username,
          currentUser.password,
          item.imageError.Image,
          item.imageError.MimeType
        );

        if (!response || response.error) {
          throw new Error(response?.error || `Image upload failed`);
        }

        results.push({
          FormId: item.traceImageData.FormId,
          ElementTypeId: item.traceImageData.ElementTypeId,
          ErrorTypeId: item.traceImageData.ErrorTypeId,
          logbookImageId: item.traceImageData.Field === "logbook" ? response : null,
          technicalAspectsImageId: item.traceImageData.Field === "technicalaspects" ? response : null,
        });
      }
      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // Navigation button
  const renderAddPersonButton = useCallback(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate("Aanwezig bij Audit", { AuditId })}
          style={{ paddingHorizontal: 12, paddingVertical: 8 }}
        >
          <MIcon name="person-add" size={24} color="white" />
        </Pressable>
      ),
    });
  }, [navigation, AuditId]);

  // Start/Resume handler
  const onStartResume = useCallback(() => {
    database.getLastUncompletedForm(AuditId)
      .then(form => {
        if (form) {
          navigation.navigate("Audit Formulier", { form });
        } else {
          navigation.navigate("Uitgevoerde Audit", { audit, clientName, user });
        }
      })
      .catch(console.error);
  }, [AuditId, audit, clientName, user, navigation]);

  // Loading state
  if (loading) {
    return (
      <Center flex={1} bg={bgMain}>
        <VStack space="md" alignItems="center" px="$8">
          <Spinner size="large" color="$amber500" />
          <Text color={textColor} fontSize="$md" textAlign="center">{loadingText}</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box flex={1} bg={bgMain}>
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 16 }}
        nestedScrollEnabled={true}
      >
        <AuditInfoSection
          audit={audit}
          cardBg={cardBg}
          headingTextColor={headingTextColor}
          textColor={textColor}
        />

        <CategoriesSection
          categories={categories}
          cardBg={cardBg}
          headingTextColor={headingTextColor}
        />

        <KpiSection
          kpiElements={kpiElements}
          onChange={handleKpiValueChange}
          openRemarkModal={openRemarkModal}
          cardBg={cardBg}
          headingTextColor={headingTextColor}
        />

        <SignatureSection
          signature={signature}
          signatureSaved={signatureSaved}
          signatureRef={signatureRef}
          handleSignature={handleSignature}
          handleClearSignature={handleClearSignature}
          saveSignature={saveSignature}
          disableScroll={disableScroll}
          enableScroll={enableScroll}
          cardBg={cardBg}
          headingTextColor={headingTextColor}
        />
      </ScrollView>

      {/* Sticky Footer Buttons */}
      <Box px="$4" py="$3" pb="$6" bg={bgMain} shadowColor="$black" shadowOffset={{ width: 0, height: -2 }} shadowOpacity={0.1} shadowRadius={3}>
        <HStack space="sm">
          <Button
            flex={1}
            size="md"
            bg={formsCount > 0 ? "$purple500" : "$backgroundLight300"}
            borderRadius="$xl"
            isDisabled={formsCount === 0}
            onPress={() => navigation.navigate("Formulieren Overzicht", { AuditId, auditCode: audit.AuditCode })}
          >
            <HStack alignItems="center" space="xs">
              <MIcon name="list-alt" size={16} color="#fff" />
              <ButtonText color="$white" fontWeight="$bold" fontSize="$sm">Formulieren</ButtonText>
            </HStack>
          </Button>
          <Button
            flex={1}
            size="md"
            bg={isUploadReady ? "$green500" : "$backgroundLight300"}
            borderRadius="$xl"
            isDisabled={!isUploadReady}
            onPress={handleUpload}
          >
            <HStack alignItems="center" space="xs">
              <MIcon name="cloud-upload" size={16} color="#fff" />
              <ButtonText color="$white" fontWeight="$bold" fontSize="$sm">Upload</ButtonText>
            </HStack>
          </Button>
          <Button
            flex={1}
            size="md"
            bg="$amber500"
            borderRadius="$xl"
            onPress={onStartResume}
          >
            <HStack alignItems="center" space="xs">
              <MIcon name="play-arrow" size={16} color="#fff" />
              <ButtonText color="$white" fontWeight="$bold" fontSize="$sm">Starten</ButtonText>
            </HStack>
          </Button>
        </HStack>
      </Box>

      {/* Modals */}
      <RemarkModal2
        isOpen={remarkModalVisible}
        onClose={() => setRemarkModalVisible(false)}
        currentKPI={currentKPI}
        saveRemark={saveRemark}
        btnColor={btnColor}
      />

      <UploadModal
        isOpen={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        onConfirm={getFormsToSubmit}
      />

      <UploadProgressModal
        visible={showProgressModal}
        uploadState={uploadState}
        onRetry={() => getFormsToSubmit()}
        onClose={() => setShowProgressModal(false)}
        onFinish={() => {
          setShowProgressModal(false);
          navigation.navigate("Opdrachtgever");
        }}
      />

      {/* UploadErrorDialogComponent removed - merged into UploadProgressModal */}
    </Box>
  );
};

// Remark Modal Component (kept inline for state access)
const remarkModalStyles = StyleSheet.create({
  input: {
    height: 100,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    padding: 12,
    color: "black",
    backgroundColor: "#f9f9f9",
    textAlignVertical: "top",
  },
});

const RemarkModal2 = React.memo(({ isOpen, onClose, currentKPI, saveRemark, btnColor }) => {
  const [localRemark, setLocalRemark] = useState("");
  const inputRef = React.useRef(null);

  useEffect(() => {
    if (isOpen) {
      setLocalRemark(currentKPI?.ElementComment || "");
    }
  }, [isOpen, currentKPI]);

  const handleSave = useCallback(() => {
    saveRemark(localRemark);
  }, [localRemark, saveRemark]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent maxWidth={400} borderRadius="$2xl">
        <ModalHeader borderBottomWidth={0}>
          <HStack alignItems="center" space="sm">
            <Center bg="$orange100" w="$8" h="$8" borderRadius="$lg">
              <MIcon name="edit-note" size={16} color="#ea580c" />
            </Center>
            <Text fontSize="$md" fontWeight="$bold">Opmerkingen</Text>
          </HStack>
          <ModalCloseButton>
            <Icon as={CloseIcon} />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          <FormControl>
            <FormControlLabel>
              <FormControlLabelText>{currentKPI?.ElementLabel}</FormControlLabelText>
            </FormControlLabel>
            <TextInput
              ref={inputRef}
              placeholder="Type hier uw opmerking..."
              value={localRemark}
              onChangeText={setLocalRemark}
              numberOfLines={4}
              style={remarkModalStyles.input}
              multiline
              blurOnSubmit={false}
              returnKeyType="default"
            />
          </FormControl>
        </ModalBody>
        <ModalFooter borderTopWidth={0}>
          <HStack space="sm">
            <Button variant="outline" onPress={onClose} borderRadius="$xl">
              <ButtonText color="$textLight600">Annuleren</ButtonText>
            </Button>
            <Button onPress={handleSave} bg="$amber500" borderRadius="$xl">
              <ButtonText color="$white">Opslaan</ButtonText>
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});

// Upload Error Dialog Component
const UploadErrorDialogComponent = ({ visible, info, onRetry, onClose }) => {
  const failures = info.failedAudits || [];

  return (
    <Modal isOpen={visible} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent borderRadius="$2xl">
        <ModalHeader borderBottomWidth={0}>
          <HStack alignItems="center" space="sm">
            <Center bg="$red100" w="$8" h="$8" borderRadius="$lg">
              <MIcon name="error" size={16} color="#dc2626" />
            </Center>
            <Text fontSize="$md" fontWeight="$bold">Upload Mislukt</Text>
          </HStack>
          <ModalCloseButton>
            <Icon as={CloseIcon} />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          <VStack space="md">
            <Text fontWeight="$bold">{failures.length} Audit(s) niet geupload</Text>
            <ScrollView style={{ maxHeight: 200 }}>
              <VStack space="sm">
                {failures.map((fail, idx) => (
                  <Box key={idx} bg="$red50" p="$3" borderRadius="$xl">
                    <Text fontWeight="$bold" color="#b91c1c">Audit: {fail.auditCode}</Text>
                    <Text fontSize="$xs" color="#dc2626">{fail.errorMessage}</Text>
                  </Box>
                ))}
              </VStack>
            </ScrollView>
            <Box bg="$green50" p="$3" borderRadius="$xl">
              <Text fontSize="$xs" color="#15803d">
                Succesvolle audits zijn verwijderd. Mislukte audits zijn veilig opgeslagen.
              </Text>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter borderTopWidth={0}>
          <VStack space="sm" width="100%">
            <Button onPress={onRetry} bg="$amber500" borderRadius="$xl" width="100%">
              <ButtonText color="$white">Opnieuw Proberen</ButtonText>
            </Button>
            <Button onPress={onClose} variant="outline" borderRadius="$xl" width="100%">
              <ButtonText color="$textLight600">Later</ButtonText>
            </Button>
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AuditDetails;
