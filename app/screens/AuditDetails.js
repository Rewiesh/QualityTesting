/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable react/self-closing-comp */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-alert */
/* eslint-disable no-trailing-spaces */
/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useRef } from "react";
import debounce from "lodash.debounce";
import {
  Box,
  VStack,
  Text,
  Heading,
  ScrollView,
  Center,
  Spinner,
  Button,
  Select,
  CheckIcon,
  HStack,
  Modal,
  FormControl,
  Input,
  Image,
  useTheme,
  useColorModeValue,
  Pressable,
  TextArea,
  Icon,
} from "native-base";
import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import Signature from "react-native-signature-canvas";
import RNFS from "react-native-fs";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import api from "../services/api/Api";
import { uploadImage, uploadAudit } from "../services/api/Api1";
import { uploadAuditData, uploadAuditImage } from "../services/api/newAPI";
import * as database from "../services/database/database1";
import userManager from "../services/UserManager";

const AuditDetails = ({ route, navigation }) => {
  const theme = useTheme();
  const scrollViewRef = useRef();
  const signatureRef = useRef(null);
  const isFocused = useIsFocused();
  //
  const { AuditId, clientName, user } = route.params;
  //
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Gegegevens worden geladen");
  const [audit, setAudit] = useState({});
  const [categories, setCategories] = useState([]);
  const [signature, setSignature] = useState(null);
  const [kpiElements, setKpiElements] = useState([]);
  //
  const [signatureSaved, setSignatureSaved] = useState(false);
  const [ready, setReady] = useState(false);
  const [remarkModalVisible, setRemarkModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadErrorDialogVisible, setUploadErrorDialogVisible] = useState(false);
  const [uploadErrorInfo, setUploadErrorInfo] = useState({});
  const [currentKPI, setCurrentKPI] = useState({});
  const [remark, setRemark] = useState("");
  // Modern UI Colors
  const bgMain = useColorModeValue("coolGray.100", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const headingTextColor = useColorModeValue("coolGray.800", "white");
  const textColor = useColorModeValue("coolGray.800", "white");
  const btnColor = useColorModeValue(
    theme.colors.fdis[400],
    theme.colors.fdis[600],
  );
  const refreshingIndicatorColor = useColorModeValue(
    theme.colors.fdis[400],
    "white",
  );

  useEffect(() => {
    if (isFocused) {
      renderAddPersonButton();
      fetchAuditData();
    }
  }, [isFocused, AuditId, navigation]);

  const fetchAuditData = () => {
    setLoading(true);
    database
      .getAuditById(AuditId)
      .then(audit => {
        setAudit(audit);
        console.log("audit.NameClient: " + audit.NameClient);
        console.log("audit.LocationSize: " + audit.LocationSize);

        return audit;
      })
      .then(audit =>
        Promise.all([
          database.getTotalCounterElementByCategory(
            audit.NameClient,
            audit.LocationSize,
          ),
          database.getAuditCounterElements(audit.Id),
          database.getAuditSignature(audit.AuditCode),
        ]),
      )
      .then(([categories, counters, signatureData]) => {
        const all = categories.map((cat, index) => {
          const counter = counters.find(
            counter => counter.CategoryId === cat.Id,
          ) || { CounterElements: 0 };
          return { ...cat, CounterElements: counter.CounterElements };
        });
        setCategories(all);
        setSignature(signatureData);
        if (signatureData != null) {
          setSignatureSaved(true);
          setReady(true);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });

    database
      .getAllElements(AuditId)
      .then(elements => {
        setKpiElements(elements);
        // console.log('Get KPI Elements ' + JSON.stringify(elements));
      })
      .catch(error => console.error(error));

  };

  const handleSignature = async signature => {
    setSignature(signature);
    try {
      // Check if the signature includes the base64 prefix and remove it if necessary
      const base64Signature = signature.replace(/^data:image\/png;base64,/, "");

      // Generate a unique filename
      const filename = `signature_${audit.AuditCode}.png`;
      const path = "file://" + `${RNFS.DocumentDirectoryPath}/${filename}`;

      // Convert the base64 signature to a file
      await RNFS.writeFile(path, base64Signature, "base64");
      console.log("Signature saved to:", path);

      // Update the database with the path to the signature image
      await database.upsertSignature(audit.AuditCode, path); // Make sure to await the promise
      setSignatureSaved(true);
      setReady(true);
      console.log("Audit signature operation completed successfully.");
    } catch (error) {
      console.error("Error performing audit signature operation:", error);
    }
  };

  const handleClearSignature = async () => {
    console.log("Attempting to clear signature"); // Log when attempting to clear

    if (signatureRef.current) {
      signatureRef.current.clearSignature(); // Clear the signature canvas
      console.log("Signature canvas cleared"); // Confirm canvas clear
    }

    if (signature !== null) {
      setSignature(null); // Only update state if necessary
      console.log("Signature state cleared"); // Confirm state clear

      // Assuming 'auditCode' is available in your component's state or derived from props
      if (audit && audit.AuditCode) {
        try {
          await database.deleteAuditSignature(audit.AuditCode);
          console.log(
            "Audit signature deleted successfully for AuditCode:",
            audit.AuditCode,
          );
        } catch (error) {
          console.error("Error deleting audit signature:", error);
        }
      } else {
        console.log(
          "No AuditCode available, cannot delete signature from database",
        );
      }
    }
    setSignatureSaved(false);
    setReady(false);
  };

  const saveSignature = () => {
    signatureRef.current.readSignature();
  };

  const disableScroll = () =>
    scrollViewRef.current.setNativeProps({ scrollEnabled: false });
  const enableScroll = () =>
    scrollViewRef.current.setNativeProps({ scrollEnabled: true });

  const isUploadReady = () => {
    return ready == true && signatureSaved === true;
  };

  const uncomplete = () => {
    setUploadModalVisible(false); // Initially set the modal to not visible
    console.log("fff");
    for (let i = categories.length - 1; i >= 0; i--) {
      if (
        parseInt(categories[i].CounterElements, 10) <
        parseInt(categories[i].Min, 10)
      ) {
        setUploadModalVisible(true); // Open the modal if condition is met
        return;
      }
    }
    getFormsToSubmit(); // Continue with form submission if all checks pass
  };

  const getFormsToSubmit = async () => {
    try {
      if (uploadModalVisible) {
        setUploadModalVisible(false);
      }
      setLoading(true);
      setLoadingText("Voorbereiden op uploaden ...");
      const [allReadyAudits] = await Promise.all([
        database.getCompletedAudits(),
      ]);
      console.log("All Ready Audits:", allReadyAudits);
      console.log("allReadyAudits.length:", allReadyAudits.length);
      setLoadingText(allReadyAudits.length + " voltooide audits gevonden.");
      setTimeout(() => { }, 500);

      const failedAudits = []; // Keep track of failed audits

      for (let i = 0; i < allReadyAudits.length; i++) {
        const uploadAuditId = allReadyAudits[i].Id;
        const uploadAuditCode = allReadyAudits[i].AuditCode;

        console.log("AuditCode:", uploadAuditCode);
        // Update the loading text to show progress
        const currectAuditLoadingText = `Audit: ${uploadAuditCode} wordt nu upgeload (${i + 1}/${allReadyAudits.length})`;
        setLoadingText(currectAuditLoadingText);
        try {
          // Markeer als "uploading"
          await database.setAuditUploadStatus(uploadAuditId, 'uploading', null);

          // 🧪 TEST: Forceer een error voor testing
          const testAuditCodes = ['20016', '20018', '20019', '20020', '20021', '20022', '20023', '20024', '20025'];
          if (testAuditCodes.includes(uploadAuditCode)) { // Gebruik jouw test audit code
            throw new Error('TEST ERROR: Simulated network failure');
          }

          // Upload images
          const uploadResults = await uploadImages(
            currectAuditLoadingText,
            uploadAuditId,
            uploadAuditCode // Pass code for testing
          );
          setLoadingText(
            `${currectAuditLoadingText}\n${"Formulieren uploaden..."}`,
          );
          setLoading(true);
          console.log(
            "Upload results: " + JSON.stringify(uploadResults, null, 2),
          );
          console.log("Getting data for uploading auditId: " + uploadAuditId);
          const [
            user,
            forms,
            auditElements,
            auditSignature,
            dateString,
            clients,
            images,
          ] = await Promise.all([
            userManager.getCurrentUser(),
            database.getAllForms(uploadAuditId),
            database.getAllElements(uploadAuditId),
            database.getAuditSignature(uploadAuditCode),
            database.getAuditDate(uploadAuditId),
            database.getAllPresentClient(uploadAuditId),
            database.getErrorsImages(uploadAuditId),
          ]);
          console.log("auditSignature: ", auditSignature);

          // 🧪 TEST: Forceer Signature Error
          if (['20026', '20030'].includes(uploadAuditCode)) {
            throw new Error(`Signature upload failed for audit ${uploadAuditCode}: No ID returned (TEST)`);
          }

          const responseSign = await uploadAuditImage(
            user.username,
            user.password,
            "file://" + auditSignature,
            "image/png",
          );

          if (!responseSign || responseSign.error) {
            throw new Error(responseSign?.error || `Signature upload failed for audit ${uploadAuditCode}: No ID returned`);
          }

          const SignatureImageId = responseSign;
          console.log('SignatureImageId', SignatureImageId);
          if (!dateString) {
            throw new Error("Audit date is undefined");
          }
          const date = new Date(dateString);
          if (isNaN(date)) {
            throw new Error("Invalid audit date format");
          }
          const auditDate = date.toISOString();
          const request = {
            audit: {
              Id: uploadAuditId,
              Code: uploadAuditCode,
              DateTime: auditDate,
              SignatureImageId: SignatureImageId,
              PresentClients: clients.map(client => client.name),
              Elements: auditElements,
            },
            forms: forms,
          };
          // Add the logbookImageId and technicalAspectsImageId to forms.errors
          if (uploadResults != null) {
            forms.forEach(form => {
              if (form.Errors) {
                form.Errors.forEach(error => {
                  uploadResults.forEach(uploadResult => {
                    if (
                      form.Id === uploadResult.FormId &&
                      error.ElementTypeId === uploadResult.ElementTypeId &&
                      error.ErrorTypeId === uploadResult.ErrorTypeId
                    ) {
                      if (uploadResult.logbookImageId) {
                        error.LogbookImageId = uploadResult.logbookImageId;
                      }
                      if (uploadResult.technicalAspectsImageId) {
                        error.TechnicalAspectsImageId =
                          uploadResult.technicalAspectsImageId;
                      }
                    }
                  });
                });
              }
            });
          }
          console.log(
            uploadAuditCode +
            " Upload JSON: " +
            JSON.stringify(request, null, 2),
          );
          const response = await uploadAuditData(
            user.username,
            user.password,
            request,
          );

          // 🧪 TEST: Forceer Final Upload Error (Empty Response)
          if (['20028', '20032'].includes(uploadAuditCode)) {
            console.log("TEST: Simulating empty response for audit " + uploadAuditCode);
            // We throw here to simulate validation failure
            throw new Error("Audit upload failed: No response from server (TEST)");
          }

          console.log("Upload Response: ", response);

          // Validate the response from the server
          if (!response || response.error) {
            throw new Error(response?.error || "Audit upload failed: No response from server");
          }
          // If your server returns a specific success structure (e.g. response.result === 'OK'), check it here
          // For now, assuming non-null return means success based on newAPI.js implementation
          setLoadingText("Audit is succesvol geupload");
          setLoadingText("Lokale data worden opgeschoond.");

          // ✅ ALLEEN bij VOLLEDIGE success: verwijder data
          await database.removeAllFromAudit(uploadAuditId);
          await database.deleteAudit(uploadAuditId);

          setLoadingText("Lokale data opgeschoond.");
          console.log(`Audit ${uploadAuditCode} successfully uploaded and removed`);
        } catch (error) {
          // ❌ Bij error: markeer als failed maar ga door met de volgende
          console.error(`Upload failed for ${uploadAuditCode}:`, error);

          await database.setAuditUploadStatus(
            uploadAuditId,
            'failed',
            error.message
          );

          failedAudits.push({
            auditCode: uploadAuditCode,
            auditId: uploadAuditId,
            errorMessage: error.message,
          });
        }
      }

      setLoading(false);
      setLoadingText("");

      if (failedAudits.length > 0) {
        // Toon error dialog met alle errors
        setUploadErrorInfo({ failedAudits });
        setUploadErrorDialogVisible(true);
      } else {
        // Alleen navigeren als alles succesvol was
        setTimeout(() => {
          navigation.navigate("Opdrachtgever");
        }, 1000);
      }

    } catch (error) {
      setLoading(false);
      console.error(error);
      alert(error.message);
    }
  };

  const uploadImages = async (uploadText, UploadAuditId, UploadAuditCode) => {
    setLoadingText(`${uploadText}\n${"Uploaden van foto..."}`);
    setLoading(true);

    let auditId = UploadAuditId;
    let logbookImageId = null;
    let technicalAspectsImageId = null;

    // 🧪 TEST: Forceer Image Error
    if (['20027', '20031'].includes(UploadAuditCode)) {
      // We simulate this by throwing an error inside the function, 
      // mimicking the behavior when an image fails to retrieve an ID or network fails
      console.error("TEST ERROR: Simulated Image Upload Failure for " + UploadAuditCode);
      setLoading(false);
      throw new Error(`Image upload failed for item TEST: No ID returned (TEST)`);
    }

    try {
      const user = await userManager.getCurrentUser();
      const [errorImages, remarks] = await Promise.all([
        database.getErrorsImages(auditId),
      ]);

      const list = errorImages;
      const results = [];

      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        const request = {
          ...item,
        };

        console.log("UploadImage JSON: " + JSON.stringify(request, null, 2));

        setLoadingText(
          `${uploadText}\n` + item.remarkAndImage == null
            ? `Uploaden van foto’s ${i + 1}/${list.length}`
            : `Uploaden van remark’s ${i + 1}/${list.length}`,
        );

        const response = await uploadAuditImage(
          user.username,
          user.password,
          request.imageError.Image,
          request.imageError.MimeType,
        );

        if (!response || response.error) {
          throw new Error(response?.error || `Image upload failed for item ${i}: No ID returned`);
        }

        if (item.traceImageData.Field === "logbook") {
          logbookImageId = response;
        }
        if (item.traceImageData.Field === "technicalaspects") {
          technicalAspectsImageId = response;
        }

        results.push({
          FormId: item.traceImageData.FormId,
          ElementTypeId: item.traceImageData.ElementTypeId,
          ErrorTypeId: item.traceImageData.ErrorTypeId,
          logbookImageId,
          technicalAspectsImageId,
        });
      }
      setLoadingText(`${uploadText}\n${"Foto's zijn succesvol geupload."}`);
      setLoadingText(`Foto's zijn succesvol geupload.`);
      setLoading(false);

      return results;
    } catch (error) {
      console.error(error);
      setLoading(false);
      throw error; // Rethrow to let getFormsToSubmit handle it
    }
  };

  const signatureStyle = `
    .m-signature-pad {
      box-shadow: none; 
      border: none;
      width: 100%;
      height: 100%;
    }
    .m-signature-pad--body {
      border: none; 
      width: 100%; 
      height: 100%;
    }
    canvas {
      width: 100% !important;
      height: 100% !important;
      max-width: 100%;
      max-height: 100%;
    }
  `;

  const renderAddPersonButton = () => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={() =>
            navigation.navigate("Aanwezig bij Audit", { AuditId: AuditId })
          }
          startIcon={
            <Icon
              as={MaterialIcons}
              name="person-add"
              size="xl"
              color="white"
            />
          }
          variant="ghost"
          _pressed={{
            bg: "white:alpha.20",
          }}
          _text={{
            color: "white",
            fontSize: "md",
          }}
          px="3"
          py="2"
          accessibilityLabel="Add Person"
        ></Button>
      ),
    });
  };

  if (loading) {
    return (
      <Center flex={1} bg={bgMain}>
        <VStack space={4} alignItems="center" px="8">
          <Spinner
            size="lg"
            color={refreshingIndicatorColor}
            accessibilityLabel="Laden..."
          />
          <Text color={textColor} fontSize="md" textAlign="center">
            {loadingText}
          </Text>
        </VStack>
      </Center>
    );
  }

  const handleKpiValueChange = (kpi, elements_auditId, newValue) => {
    console.log("newValue : " + newValue);
    console.log("elements_auditId : " + elements_auditId);

    database.setKpiElementValue(elements_auditId, newValue);
    const updatedKpis = kpiElements.map(kpi =>
      kpi.elements_auditId === elements_auditId
        ? { ...kpi, ElementValue: newValue }
        : kpi,
    );

    setKpiElements(updatedKpis);
    if (newValue === "O") {
      setCurrentKPI(kpi);
      setRemark(kpi.ElementComment);
      setRemarkModalVisible(true);
    }
  };
  // Open remark modal and set the selected KPI
  const openRemarkModal = kpi => {
    setCurrentKPI(kpi); // Set the selected KPI as the current KPI
    setRemark(kpi.ElementComment);
    setRemarkModalVisible(true); // Open the modal
  };

  const saveRemark = newRemark => {
    console.log("New remark:", newRemark); // Log the new remark

    // Update the database with the correct ElementComment (remark)
    database.setKpiElementComment(
      currentKPI.elements_auditId,
      newRemark, // Use the new remark passed as a parameter
    );

    // Update the list of KPIs with the updated comment
    const updatedKpis = kpiElements.map(kpi =>
      kpi.elements_auditId === currentKPI.elements_auditId
        ? { ...kpi, ElementComment: newRemark } // Set remark directly
        : kpi,
    );

    console.log("updatedKpis:", JSON.stringify(updatedKpis, null, 2));

    // Update the state and close the modal
    setKpiElements(updatedKpis);
    setRemarkModalVisible(false);
  };

  const RemarkModal2 = React.memo(({ isOpen, onClose, btnColor, value }) => {
    const [localRemark, setLocalRemark] = useState("");
    const initialRender = useRef(true);

    useEffect(() => {
      if (isOpen && initialRender.current) {
        setLocalRemark(value); // Set localRemark only when the modal opens
        initialRender.current = false; // Prevent further updates
      }
    }, [isOpen, value]); // Reset on modal open

    const styles = StyleSheet.create({
      input: {
        height: 100, // Adjust height for multi-line input
        fontSize: 12, // Adjust font size
        borderWidth: 1, // Optional: Add a border
        borderColor: "gray", // Optional: Border color
        borderRadius: 5, // Optional: Rounded corners
        padding: 10, // Optional: Padding inside the input
        color: "black"
      },
    });

    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <Modal.Content maxWidth="400px" style={{ marginBottom: "40%" }}>
          <Modal.CloseButton />
          <Modal.Header>Opmerkingen</Modal.Header>
          <Modal.Body>
            <FormControl>
              <FormControl.Label>{currentKPI?.ElementLabel}</FormControl.Label>
              <TextInput
                placeholder="Type hier uw opmerking..."
                value={localRemark}
                onChangeText={text => {
                  console.log(text); // Capture and log the updated text
                  setLocalRemark(text); // Update local state only
                }}
                // multiline={true} // Enable multi-line input
                numberOfLines={4} // Set the initial number of lines
                style={styles.input} // Apply custom styles
              />
            </FormControl>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" onPress={onClose}>
                Annuleren
              </Button>
              <Button
                onPress={() => {
                  console.log("localRemark ==> " + localRemark);
                  saveRemark(localRemark); // Call saveRemark without parameters
                }}
                bg={btnColor}
                _text={{ color: "white" }}
              >
                Opslaan
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    );
  });

  const UploadErrorDialog = ({ visible, info, onRetry, onClose }) => {
    const failures = info.failedAudits || (info.auditCode ? [info] : []);

    return (
      <Modal isOpen={visible} onClose={onClose}>
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>❌ Upload Mislukt</Modal.Header>
          <Modal.Body>
            <VStack space={3}>
              <Text bold fontSize="md">
                {failures.length} Audit(s) niet geupload
              </Text>

              <ScrollView maxH="200">
                <VStack space={2}>
                  {failures.map((fail, idx) => (
                    <Box key={idx} bg="red.100" p={2} rounded="md">
                      <HStack justifyContent="space-between">
                        <Text bold>Audit: {fail.auditCode}</Text>
                      </HStack>
                      <Text fontSize="xs" color="red.700">{fail.errorMessage}</Text>
                    </Box>
                  ))}
                </VStack>
              </ScrollView>

              <Box bg="green.100" p={2} rounded="md">
                <Text fontSize="xs" color="green.700">
                  ✅ Succesvolle audits zijn verwijderd van het apparaat. Data van mislukte audits is VEILIG opgeslagen en kan later opnieuw geprobeerd worden.
                </Text>
              </Box>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2} flexDirection="column" width="100%">
              <Button onPress={onRetry} colorScheme="blue" width="100%">
                🔄 Opnieuw Proberen (Alles)
              </Button>
              <Button onPress={onClose} variant="ghost" width="100%">
                Later
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    );
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      flex={1}
      bg={bgMain}
      _contentContainerStyle={{
        p: "4",
        pb: "120",
      }}
    >
      {/* Audit Info Section */}
      <AuditSection
        audit={audit}
        cardBg={cardBg}
        headingTextColor={headingTextColor}
        textColor={textColor}
      />

      {/* Categories Section */}
      <Box bg={cardBg} rounded="2xl" shadow={2} mt={4} overflow="hidden">
        <Box px="4" py="3" borderBottomWidth={1} borderColor="gray.100">
          <HStack alignItems="center" space={2}>
            <Center bg="blue.100" size="8" rounded="lg">
              <Icon as={MaterialIcons} name="category" size="sm" color="blue.600" />
            </Center>
            <Text fontSize="md" fontWeight="bold" color={headingTextColor}>
              Categories
            </Text>
            <Text fontSize="xs" color="gray.400">(Geteld/Minimum)</Text>
          </HStack>
        </Box>
        <VStack>
          {categories.map((category, index) => (
            <CategoryCard
              key={index}
              category={category}
              isLast={index === categories.length - 1}
            />
          ))}
        </VStack>
      </Box>

      {/* KPI Section */}
      <Box bg={cardBg} rounded="2xl" shadow={2} mt={4} overflow="hidden">
        <Box px="4" py="3" borderBottomWidth={1} borderColor="gray.100">
          <HStack alignItems="center" space={2}>
            <Center bg="purple.100" size="8" rounded="lg">
              <Icon as={MaterialIcons} name="analytics" size="sm" color="purple.600" />
            </Center>
            <Text fontSize="md" fontWeight="bold" color={headingTextColor}>
              KPI-metrieken
            </Text>
          </HStack>
        </Box>
        <VStack>
          {kpiElements.map((kpi, index) => (
            <KpiRow
              key={index}
              kpi={kpi}
              onChange={handleKpiValueChange}
              openRemarkModal={() => openRemarkModal(kpi)}
              isLast={index === kpiElements.length - 1}
            />
          ))}
        </VStack>
      </Box>

      <RemarkModal2
        btnColor={btnColor}
        isOpen={remarkModalVisible}
        onClose={() => setRemarkModalVisible(false)}
        value={remark}
      />

      {/* Start/Resume Button */}
      <Button
        mt="4"
        size="lg"
        bg="fdis.500"
        _pressed={{ bg: "fdis.600" }}
        _text={{ color: "white", fontWeight: "bold" }}
        rounded="xl"
        leftIcon={<Icon as={MaterialIcons} name="play-arrow" size="md" color="white" />}
        onPress={() =>
          onStartResumeClick({ AuditId, navigation, audit, user, clientName })
        }
      >
        Starten/Hervatten
      </Button>

      {/* Signature Section */}
      <Box bg={cardBg} rounded="2xl" shadow={2} mt={4} overflow="hidden">
        <Box px="4" py="3" borderBottomWidth={1} borderColor="gray.100">
          <HStack alignItems="center" space={2}>
            <Center bg="green.100" size="8" rounded="lg">
              <Icon as={MaterialIcons} name="draw" size="sm" color="green.600" />
            </Center>
            <Text fontSize="md" fontWeight="bold" color={headingTextColor}>
              Handtekening
            </Text>
            {signatureSaved && (
              <Box bg="green.100" px="2" py="0.5" rounded="full" ml="auto">
                <Text fontSize="2xs" fontWeight="bold" color="green.600">Opgeslagen</Text>
              </Box>
            )}
          </HStack>
        </Box>
        
        <Box p="4">
          {signature ? (
            <Box bg="gray.50" rounded="xl" overflow="hidden" borderWidth={1} borderColor="gray.200">
              <Image
                alt="signature"
                resizeMode="contain"
                source={{ uri: signature }}
                style={{
                  width: "100%",
                  height: 120,
                  backgroundColor: "white",
                }}
              />
            </Box>
          ) : (
            <Box bg="gray.50" rounded="xl" overflow="hidden" borderWidth={1} borderColor="gray.200">
              <View
                style={{ height: 120 }}
                onTouchStart={() => disableScroll()}
                onTouchEnd={() => enableScroll()}
                onTouchCancel={() => enableScroll()}
              >
                <Signature
                  ref={signatureRef}
                  onOK={handleSignature}
                  onBegin={disableScroll}
                  onEnd={enableScroll}
                  webStyle={signatureStyle}
                />
              </View>
            </Box>
          )}

          <HStack space={3} mt="4">
            <Button
              flex={1}
              variant="outline"
              borderColor="gray.300"
              _text={{ color: "gray.600" }}
              _pressed={{ bg: "gray.100" }}
              rounded="xl"
              leftIcon={<Icon as={MaterialIcons} name="clear" size="sm" color="gray.500" />}
              onPress={handleClearSignature}
            >
              Wissen
            </Button>
            <Button
              flex={1}
              bg="fdis.500"
              _pressed={{ bg: "fdis.600" }}
              _text={{ color: "white" }}
              rounded="xl"
              leftIcon={<Icon as={MaterialIcons} name="save" size="sm" color="white" />}
              onPress={saveSignature}
              isDisabled={!!signature}
            >
              Opslaan
            </Button>
          </HStack>
        </Box>
      </Box>

      {/* Upload Button */}
      <Button
        mt="4"
        size="lg"
        bg={isUploadReady() ? "green.500" : "gray.300"}
        _pressed={{ bg: isUploadReady() ? "green.600" : "gray.300" }}
        _text={{ color: "white", fontWeight: "bold" }}
        rounded="xl"
        leftIcon={<Icon as={MaterialIcons} name="cloud-upload" size="md" color="white" />}
        isDisabled={!isUploadReady()}
        onPress={uncomplete}
      >
        Uploaden
      </Button>

      <UploadModal
        isOpen={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        onConfirm={() => {
          console.log("Confirm upload");
          getFormsToSubmit();
        }}
      />
      <UploadErrorDialog
        visible={uploadErrorDialogVisible}
        info={uploadErrorInfo}
        onRetry={() => {
          setUploadErrorDialogVisible(false);
          getFormsToSubmit();
        }}
        onClose={() => setUploadErrorDialogVisible(false)}
      />
    </ScrollView>
  );
};

const AuditSection = ({
  audit,
  cardBg,
  headingTextColor,
  textColor,
}) => {
  const infoItems = [
    { label: "Klant", value: audit.NameClient, icon: "business" },
    { label: "Code", value: audit.AuditCode, icon: "tag" },
    { label: "Type", value: audit.Type, icon: "assignment" },
    { label: "Locatie", value: audit.LocationClient, icon: "location-on" },
  ];

  return (
    <Box bg={cardBg} rounded="2xl" shadow={2} overflow="hidden">
      <Box px="4" py="3" borderBottomWidth={1} borderColor="gray.100">
        <HStack alignItems="center" space={2}>
          <Center bg="fdis.100" size="8" rounded="lg">
            <Icon as={MaterialIcons} name="info" size="sm" color="fdis.600" />
          </Center>
          <Text fontSize="md" fontWeight="bold" color={headingTextColor}>
            Audit Informatie
          </Text>
        </HStack>
      </Box>
      <VStack px="4" py="2">
        {infoItems.map((item, index) => (
          <HStack
            key={index}
            py="3"
            alignItems="center"
            borderBottomWidth={index < infoItems.length - 1 ? 1 : 0}
            borderColor="gray.100"
          >
            <Center bg="gray.100" size="8" rounded="lg" mr="3">
              <Icon as={MaterialIcons} name={item.icon} size="xs" color="gray.500" />
            </Center>
            <VStack flex={1}>
              <Text fontSize="xs" color="gray.400">{item.label}</Text>
              <Text fontSize="sm" fontWeight="medium" color={textColor}>
                {item.value || "-"}
              </Text>
            </VStack>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

const CategoryCard = ({ category, isLast }) => {
  const count = category.CounterElements || 0;
  const min = category.Min || 0;
  const isFail = count < min;
  const isComplete = count >= min;

  return (
    <HStack
      px="4"
      py="3"
      alignItems="center"
      borderBottomWidth={isLast ? 0 : 1}
      borderColor="gray.100"
    >
      <VStack flex={1}>
        <Text fontSize="sm" fontWeight="medium" color="coolGray.800">
          {category.CategoryValue}
        </Text>
      </VStack>
      <HStack alignItems="center" space={2}>
        <Box
          bg={isComplete ? "green.100" : "red.100"}
          px="3"
          py="1"
          rounded="full"
        >
          <Text
            fontSize="sm"
            fontWeight="bold"
            color={isComplete ? "green.600" : "red.600"}
          >
            {count}/{min}
          </Text>
        </Box>
        <Icon
          as={MaterialIcons}
          name={isComplete ? "check-circle" : "error"}
          size="sm"
          color={isComplete ? "green.500" : "red.500"}
        />
      </HStack>
    </HStack>
  );
};

const KpiRow = ({ kpi, onChange, openRemarkModal, isLast }) => {
  const getValueColor = (value) => {
    switch (value) {
      case "V": return { bg: "green.100", color: "green.600" };
      case "O": return { bg: "orange.100", color: "orange.600" };
      case "N": return { bg: "red.100", color: "red.600" };
      case "G": return { bg: "gray.100", color: "gray.600" };
      default: return { bg: "gray.100", color: "gray.500" };
    }
  };

  const valueStyle = getValueColor(kpi.ElementValue);

  return (
    <Box
      px="4"
      py="3"
      borderBottomWidth={isLast ? 0 : 1}
      borderColor="gray.100"
    >
      <HStack alignItems="center" space={3}>
        <VStack flex={1}>
          <Text fontSize="sm" fontWeight="medium" color="coolGray.800">
            {kpi.ElementLabel}
          </Text>
        </VStack>
        <HStack alignItems="center" space={2}>
          <Select
            selectedValue={kpi.ElementValue}
            minWidth="80"
            accessibilityLabel="Kies waarde"
            placeholder="Kies"
            bg={valueStyle.bg}
            borderWidth={0}
            rounded="lg"
            _selectedItem={{
              bg: valueStyle.bg,
              endIcon: <CheckIcon size="4" />,
            }}
            onValueChange={value => onChange(kpi, kpi.elements_auditId, value)}
            fontSize="sm"
            fontWeight="bold"
            color={valueStyle.color}
          >
            <Select.Item label="V - Voldoende" value="V" />
            <Select.Item label="O - Onvoldoende" value="O" />
            <Select.Item label="N - Niet van toepassing" value="N" />
            <Select.Item label="G - Geen" value="G" />
          </Select>
          {kpi.ElementValue === "O" && (
            <Pressable onPress={openRemarkModal}>
              {({ isPressed }) => (
                <Center
                  bg={isPressed ? "orange.200" : "orange.100"}
                  size="10"
                  rounded="lg"
                  style={{ transform: [{ scale: isPressed ? 0.95 : 1 }] }}
                >
                  <Icon as={MaterialIcons} name="edit-note" size="sm" color="orange.600" />
                </Center>
              )}
            </Pressable>
          )}
        </HStack>
      </HStack>
    </Box>
  );
};

// const RemarkModal = ({
//   isOpen,
//   onClose,
//   label,
//   value,
//   onChangeText,
//   saveRemark,
//   btnColor,
// }) => {
//   const [localRemark, setLocalRemark] = useState(value);

//   useEffect(() => {
//     setLocalRemark(value); // Sync local state when the modal opens
//   }, [value]);

//   return (
//     <Modal isOpen={isOpen} onClose={onClose}>
//       <Modal.Content maxWidth="400px" style={{marginBottom: "40%"}}>
//         <Modal.CloseButton />
//         <Modal.Header>Opmerkingen</Modal.Header>
//         <Modal.Body>
//           <FormControl>
//             <FormControl.Label>{label}</FormControl.Label>
//             <TextArea
//               placeholder="Type hier uw opmerking..."
//               value={localRemark} // Use local state
//               onChangeText={text => {
//                 setLocalRemark(text); // Update local state
//                 onChangeText(text); // Also trigger external state update
//               }}
//             />
//           </FormControl>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button.Group space={2}>
//             <Button variant="ghost" onPress={onClose}>
//               Annuleren
//             </Button>
//             <Button onPress={saveRemark} bg={btnColor} _text={{color: "white"}}>
//               Opslaan
//             </Button>
//           </Button.Group>
//         </Modal.Footer>
//       </Modal.Content>
//     </Modal>
//   );
// };

// functions
const onStartResumeClick = ({ AuditId, navigation, audit, user, clientName }) => {
  console.log(AuditId);
  if (!AuditId) {
    console.log("Audit data is not available yet");
    return;
  }

  database
    .getLastUncompletedForm(AuditId)
    .then(form => {
      console.log(
        "Check if uncompleted form exists: " + JSON.stringify(form, null, 2),
      );

      if (form) {
        navigation.navigate("Audit Formulier", { form: form });
        console.log("Form bestaat, redirect naar Toon formulier");
      } else {
        navigation.navigate("Uitgevoerde Audit", {
          audit: audit,
          clientName: clientName,
          user: user,
        });
        console.log("rrr");
      }
    })
    .catch(console.error);
};

const UploadModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Header>Waarschuwing!</Modal.Header>
        <Modal.Body>
          <Text>
            Het vereiste aantal elementen komt niet overeen met uw telling. Weet
            u zeker dat u deze audit wilt uploaden?
          </Text>
        </Modal.Body>
        <Modal.Footer>
          <Button.Group space={2}>
            <Button variant="ghost" onPress={onClose}>
              Annuleer
            </Button>
            <Button onPress={onConfirm} colorScheme="blue">
              Ok
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};

export default AuditDetails;
