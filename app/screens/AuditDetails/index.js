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
  ScrollView,
  Center,
  Spinner,
  Button,
  HStack,
  Modal,
  FormControl,
  Icon,
  useTheme,
  useColorModeValue,
} from "native-base";
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
  const theme = useTheme();
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
  const bgMain = useColorModeValue("coolGray.100", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const headingTextColor = useColorModeValue("coolGray.800", "white");
  const textColor = useColorModeValue("coolGray.800", "white");
  const refreshingIndicatorColor = useColorModeValue(theme.colors.fdis[400], "white");
  const btnColor = useColorModeValue(theme.colors.fdis[400], theme.colors.fdis[600]);

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
                const imgResult = uploadResults.find(r =>
                  r.FormId === form.Id && r.ElementTypeId === error.ElementTypeId && r.ErrorTypeId === error.ErrorTypeId
                );
                if (imgResult) {
                  if (imgResult.logbookImageId) error.LogbookImageId = imgResult.logbookImageId;
                  if (imgResult.technicalAspectsImageId) error.TechnicalAspectsImageId = imgResult.technicalAspectsImageId;
                }
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
        <Button
          onPress={() => navigation.navigate("Aanwezig bij Audit", { AuditId })}
          startIcon={<Icon as={MaterialIcons} name="person-add" size="xl" color="white" />}
          variant="ghost"
          _pressed={{ bg: "white:alpha.20" }}
          px="3"
          py="2"
        />
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
        <VStack space={4} alignItems="center" px="8">
          <Spinner size="lg" color={refreshingIndicatorColor} />
          <Text color={textColor} fontSize="md" textAlign="center">{loadingText}</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box flex={1} bg={bgMain}>
      <ScrollView
        ref={scrollViewRef}
        flex={1}
        _contentContainerStyle={{ p: "4", pb: "4" }}
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
      <Box px="4" py="3" pb="6" bg={bgMain} shadow={3}>
        <HStack space={2}>
          <Button
            flex={1}
            size="md"
            bg={formsCount > 0 ? "purple.500" : "gray.300"}
            _pressed={{ bg: formsCount > 0 ? "purple.600" : "gray.300" }}
            _text={{ color: "white", fontWeight: "bold", fontSize: "sm" }}
            rounded="xl"
            leftIcon={<Icon as={MaterialIcons} name="list-alt" size="sm" color="white" />}
            isDisabled={formsCount === 0}
            onPress={() => navigation.navigate("Formulieren Overzicht", { AuditId, auditCode: audit.AuditCode })}
          >
            Formulieren
          </Button>
          <Button
            flex={1}
            size="md"
            bg={isUploadReady ? "green.500" : "gray.300"}
            _pressed={{ bg: isUploadReady ? "green.600" : "gray.300" }}
            _text={{ color: "white", fontWeight: "bold", fontSize: "sm" }}
            rounded="xl"
            leftIcon={<Icon as={MaterialIcons} name="cloud-upload" size="sm" color="white" />}
            isDisabled={!isUploadReady}
            onPress={handleUpload}
          >
            Upload
          </Button>
          <Button
            flex={1}
            size="md"
            bg="fdis.500"
            _pressed={{ bg: "fdis.600" }}
            _text={{ color: "white", fontWeight: "bold", fontSize: "sm" }}
            rounded="xl"
            leftIcon={<Icon as={MaterialIcons} name="play-arrow" size="sm" color="white" />}
            onPress={onStartResume}
          >
            Starten
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      avoidKeyboard
      _overlay={{ useRNModal: true }}
    >
      <Modal.Content maxWidth="400px" rounded="2xl">
        <Modal.CloseButton />
        <Modal.Header borderBottomWidth={0}>
          <HStack alignItems="center" space={2}>
            <Center bg="orange.100" size="8" rounded="lg">
              <Icon as={MaterialIcons} name="edit-note" size="sm" color="orange.600" />
            </Center>
            <Text fontSize="md" fontWeight="bold">Opmerkingen</Text>
          </HStack>
        </Modal.Header>
        <Modal.Body>
          <FormControl>
            <FormControl.Label>{currentKPI?.ElementLabel}</FormControl.Label>
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
        </Modal.Body>
        <Modal.Footer borderTopWidth={0}>
          <Button.Group space={2}>
            <Button variant="ghost" onPress={onClose} rounded="xl" _text={{ color: "gray.600" }}>
              Annuleren
            </Button>
            <Button
              onPress={handleSave}
              bg="fdis.500"
              _pressed={{ bg: "fdis.600" }}
              rounded="xl"
            >
              Opslaan
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
});

// Upload Error Dialog Component
const UploadErrorDialogComponent = ({ visible, info, onRetry, onClose }) => {
  const failures = info.failedAudits || [];

  return (
    <Modal isOpen={visible} onClose={onClose}>
      <Modal.Content rounded="2xl">
        <Modal.CloseButton />
        <Modal.Header borderBottomWidth={0}>
          <HStack alignItems="center" space={2}>
            <Center bg="red.100" size="8" rounded="lg">
              <Icon as={MaterialIcons} name="error" size="sm" color="red.600" />
            </Center>
            <Text fontSize="md" fontWeight="bold">Upload Mislukt</Text>
          </HStack>
        </Modal.Header>
        <Modal.Body>
          <VStack space={3}>
            <Text fontWeight="bold">{failures.length} Audit(s) niet geupload</Text>
            <ScrollView maxH="200">
              <VStack space={2}>
                {failures.map((fail, idx) => (
                  <Box key={idx} bg="red.50" p={3} rounded="xl">
                    <Text fontWeight="bold" color="red.700">Audit: {fail.auditCode}</Text>
                    <Text fontSize="xs" color="red.600">{fail.errorMessage}</Text>
                  </Box>
                ))}
              </VStack>
            </ScrollView>
            <Box bg="green.50" p={3} rounded="xl">
              <Text fontSize="xs" color="green.700">
                Succesvolle audits zijn verwijderd. Mislukte audits zijn veilig opgeslagen.
              </Text>
            </Box>
          </VStack>
        </Modal.Body>
        <Modal.Footer borderTopWidth={0}>
          <Button.Group space={2} flexDirection="column" width="100%">
            <Button onPress={onRetry} bg="fdis.500" _pressed={{ bg: "fdis.600" }} rounded="xl" width="100%">
              Opnieuw Proberen
            </Button>
            <Button onPress={onClose} variant="ghost" rounded="xl" width="100%">
              Later
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};

export default AuditDetails;
