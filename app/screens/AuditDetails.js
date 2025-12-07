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
import { View, StyleSheet, TextInput } from "react-native";
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
  const backgroundColor = useColorModeValue(
    "coolGray.50",
    theme.colors.fdis[1100],
  ); // Adjust for light and dark modes
  const cardBackgroundColor = useColorModeValue(
    "gray.100",
    theme.colors.fdis[900],
  );
  const headingTextColor = useColorModeValue("coolGray.800", "black");
  const textColor = useColorModeValue("coolGray.800", "black");
  const btnColor = useColorModeValue(
    theme.colors.fdis[400],
    theme.colors.fdis[600],
  );
  const listBackgroundColor = useColorModeValue(
    "white",
    theme.colors.fdis[800],
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

    // const mockElements = [
    //   {
    //     elements_auditId: 1,
    //     Id: "MOCK1",
    //     ElementLabel: "Mock Label 1",
    //     ElementValue: "Mock Value 1",
    //     AuditId: AuditId,
    //     ElementComment: "This is mock comment 1",
    //   },
    //   {
    //     elements_auditId: 2,
    //     Id: "MOCK2",
    //     ElementLabel: "Mock Label 2",
    //     ElementValue: "Mock Value 2",
    //     AuditId: AuditId,
    //     ElementComment: "This is mock comment 2",
    //   },
    // ];

    // // Simulate async behavior and set mock data
    // new Promise(resolve => {
    //   setTimeout(() => resolve(mockElements), 500);
    // })
    //   .then(elements => {
    //     setKpiElements(elements);
    //     // console.log('Get KPI Elements ' + JSON.stringify(elements));
    //   })
    //   .catch(error => console.error(error));
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
          // Upload images
          const uploadResults = await uploadImages(
            currectAuditLoadingText,
            uploadAuditId,
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
          const responseSign = await uploadAuditImage(
            user.username,
            user.password,
            "file://" + auditSignature,
            "image/png",
          );
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
          setLoadingText("Audit is succesvol geupload");
          setLoadingText("Lokale data worden opgeschoond.");

          // ✅ ALLEEN bij VOLLEDIGE success: verwijder data
          await database.removeAllFromAudit(uploadAuditId);
          await database.deleteAudit(uploadAuditId);

          setLoadingText("Lokale data opgeschoond.");
          console.log(`Audit ${uploadAuditCode} successfully uploaded and removed`);
        } catch (error) {
          // ❌ Bij error: markeer als failed en stop
          console.error(`Upload failed for ${uploadAuditCode}:`, error);

          await database.setAuditUploadStatus(
            uploadAuditId,
            'failed',
            error.message
          );

          // Stop de loop en toon error dialog
          setLoading(false);
          setUploadErrorDialogVisible(true);
          setUploadErrorInfo({
            auditCode: uploadAuditCode,
            auditId: uploadAuditId,
            errorMessage: error.message,
          });

          // Stop uploading other audits
          return;
        }
      }

      setLoadingText("");
      setLoading(false);
      // Navigate to Clients screen and trigger onReload
      setTimeout(() => {
        navigation.navigate("Opdrachtgever");
      }, 1000);
    } catch (error) {
      setLoading(false);
      console.error(error);
      alert(error.message);
    }
  };

  const uploadImages = async (uploadText, UploadAuditId) => {
    setLoadingText(`${uploadText}\n${"Uploaden van foto..."}`);
    setLoading(true);

    let auditId = UploadAuditId;
    let logbookImageId = null;
    let technicalAspectsImageId = null;

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

        // const response = await uploadImage(
        //   user.username,
        //   user.password,
        //   request.imageError.Image,
        //   request.imageError.MimeType,
        // );
        const response = await uploadAuditImage(
          user.username,
          user.password,
          request.imageError.Image,
          request.imageError.MimeType,
        );

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
      alert(error.message);
      setLoading(false);
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
          backgroundColor={btnColor}
          _pressed={{
            bg: theme.colors.fdis[500],
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
      <Center flex={1} bg={listBackgroundColor}>
        <HStack space={2} justifyContent="center" alignItems="center">
          <Spinner
            size="lg"
            color={refreshingIndicatorColor}
            accessibilityLabel="Haal actieve klanten op"
          />
          <Heading color={textColor} fontSize="md">
            {loadingText}
          </Heading>
        </HStack>
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

  const UploadErrorDialog = ({ visible, info, onRetry, onClose }) => (
    <Modal isOpen={visible} onClose={onClose}>
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Header>❌ Upload Mislukt</Modal.Header>
        <Modal.Body>
          <VStack space={3}>
            <HStack>
              <Text bold>Audit: </Text>
              <Text>{info.auditCode}</Text>
            </HStack>
            <Box bg="red.100" p={2} rounded="md">
              <Text fontSize="xs" color="red.700">{info.errorMessage}</Text>
            </Box>
            <Box bg="green.100" p={2} rounded="md">
              <Text fontSize="xs" color="green.700">
                ✅ Uw gegevens zijn VEILIG opgeslagen op het apparaat
              </Text>
            </Box>
          </VStack>
        </Modal.Body>
        <Modal.Footer>
          <Button.Group space={2} flexDirection="column" width="100%">
            <Button onPress={onRetry} colorScheme="blue" width="100%">
              🔄 Opnieuw Proberen
            </Button>
            <Button onPress={onClose} variant="ghost" width="100%">
              Later
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );

  return (
    <ScrollView
      ref={scrollViewRef}
      flex={1}
      bg={backgroundColor}
      _contentContainerStyle={{
        p: "2",
        mb: "4",
        pb: "120", // Adjust this value to the height of your footer
      }}
    >
      <AuditSection
        audit={audit}
        cardBackgroundColor={cardBackgroundColor}
        headingTextColor={headingTextColor}
        textColor={textColor}
      />
      <VStack
        bg={cardBackgroundColor}
        space={2}
        p="1"
        shadow="1"
        mt={2}
        rounded={"xs"}
      >
        <Heading fontSize="lg" bold mt="1" color={headingTextColor} p="2">
          Categories (Geteld/Minimum)
        </Heading>
        {categories.map((category, index) => (
          <CategoryCard
            key={index}
            category={category}
            cardBackgroundColor={cardBackgroundColor}
          />
        ))}
      </VStack>
      <VStack
        bg={cardBackgroundColor}
        space={2}
        p="1"
        shadow="1"
        mt={2}
        rounded={"xs"}
      >
        <Heading fontSize="lg" bold mt="1" color={headingTextColor}>
          KPI-metrieken
        </Heading>
        {kpiElements.map((kpi, index) => (
          <KpiRow
            key={index}
            kpi={kpi}
            onChange={handleKpiValueChange}
            cardBackgroundColor={cardBackgroundColor}
            openRemarkModal={() => openRemarkModal(kpi)}
          />
        ))}
      </VStack>
      <RemarkModal2
        btnColor={btnColor}
        isOpen={remarkModalVisible}
        onClose={() => setRemarkModalVisible(false)}
        value={remark}
      // onChangeText={setRemark}
      // currentKPI={currentKPI}
      // setCurrentKPI={setCurrentKPI}
      // saveRemark={saveRemark}
      />
      <Button
        mt="2"
        bg={useColorModeValue(theme.colors.fdis[400], theme.colors.fdis[600])}
        _text={{ color: "white" }}
        onPress={() =>
          onStartResumeClick({ AuditId, navigation, audit, user, clientName })
        }
      >
        Starten/Hervatten
      </Button>
      <VStack
        space={2}
        bg={cardBackgroundColor}
        p="1"
        shadow="1"
        mt={2}
        rounded={"xs"}
      >
        {signature ? (
          <Image
            alt="signature"
            resizeMode="contain"
            source={{ uri: signature }}
            style={{
              width: "100%",
              height: 120,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 5,
              overflow: "hidden", // Ensure the image does not leak outside the container
              backgroundColor: "white", // Adds background color to differentiate from empty state
            }}
          />
        ) : (
          <View style={{ height: 120, marginTop: 5, overflow: "hidden" }}>
            <Signature
              ref={signatureRef}
              onOK={handleSignature}
              onBegin={disableScroll}
              onEnd={enableScroll}
              webStyle={signatureStyle}
            />
          </View>
        )}
        <HStack flex={1} space={2}>
          <Button
            flex={1}
            mt="2"
            onPress={handleClearSignature}
            bg={useColorModeValue(
              theme.colors.fdis[400],
              theme.colors.fdis[600],
            )}
            _text={{ color: "white" }}
          >
            Handtekening wissen
          </Button>
          <Button
            flex={1}
            mt="2"
            onPress={saveSignature}
            bg={useColorModeValue(
              theme.colors.fdis[400],
              theme.colors.fdis[600],
            )}
            _text={{ color: "white" }}
          >
            Handtekening opslaan
          </Button>
        </HStack>
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
        <Button
          mt="2"
          isDisabled={!isUploadReady()}
          onPress={uncomplete}
          success={true}
          bg={useColorModeValue(theme.colors.fdis[400], theme.colors.fdis[600])}
          _text={{ color: "white" }}
        >
          Uploaden
        </Button>
      </VStack>
    </ScrollView>
  );
};

const AuditSection = ({
  audit,
  cardBackgroundColor,
  headingTextColor,
  textColor,
}) => (
  <VStack space={2} bg={cardBackgroundColor} p="2" rounded="xs" shadow="1">
    <Heading size="md" bold color={headingTextColor}>
      Informatie
    </Heading>
    <VStack
      space={0}
      divider={<Box borderBottomWidth="1" borderColor="gray.300" />}
    >
      {[
        { label: "Klant", value: audit.NameClient },
        { label: "Code", value: audit.AuditCode },
        { label: "Audit soort", value: audit.Type },
        { label: "Locatie", value: audit.LocationClient },
      ].map((item, index) => (
        <HStack
          key={index}
          justifyContent="space-between"
          alignItems="center"
          bg={index % 2 === 0 ? "gray.50" : "white"}
        >
          <Box flex={1} p="2" borderRightWidth="1" borderColor="gray.200">
            <Text fontWeight="medium" color={textColor}>
              {item.label}
            </Text>
          </Box>
          <Box flex={1} p="2">
            <Text textAlign="left" color={textColor}>
              {item.value}
            </Text>
          </Box>
        </HStack>
      ))}
    </VStack>
  </VStack>
);

const CategoryCard = ({ category, cardBackgroundColor, key }) => {
  const isFail = (category.CounterElements || 0) < (category.Min || 0);
  const textColor = useColorModeValue(
    isFail ? "red.500" : "green.500", // Bright colors for text in light mode
    isFail ? "red.500" : "green.500", // Suitable text colors for dark mode
  );
  const celColor = "gray.50";
  const borderColor = useColorModeValue("gray.300", "gray.600"); // Adaptive border color

  return (
    <Box
      borderBottomWidth="1"
      borderColor={borderColor} // Adjust borderColor for dark mode
      bg={cardBackgroundColor}
    >
      <HStack space={0}>
        <Box
          flex={1}
          borderRightWidth="1"
          borderColor={useColorModeValue("gray.200", "gray.500")} // Adjust borderColor for dark mode
          p="2"
          bg={celColor}
        >
          <Text color={textColor} textAlign="left" fontWeight="bold">
            {category.CategoryValue}
          </Text>
        </Box>
        <Box flex={1} p="2" bg={celColor}>
          <Text key={key} color={textColor} textAlign="left" fontWeight="bold">
            {category.CounterElements || 0}/{category.Min}
          </Text>
        </Box>
      </HStack>
    </Box>
  );
};

const KpiRow = ({ kpi, onChange, openRemarkModal, cardBackgroundColor }) => {
  const textColor = useColorModeValue("coolGray.800", "white"); // Text color
  const borderColor = useColorModeValue("gray.300", "white"); // Border color
  return (
    <Box
      bg={cardBackgroundColor}
      p="2"
      borderBottomWidth="1"
      borderColor={borderColor}
    >
      <VStack space={2}>
        <Text fontWeight="bold" color={textColor}>
          {kpi.ElementLabel}
        </Text>
        <HStack space={2} alignItems="center" flex={1}>
          <Select
            borderColor={borderColor}
            selectedValue={kpi.ElementValue}
            flex={1}
            accessibilityLabel="Kies waarde"
            placeholder="Kies waarde"
            _selectedItem={{
              endIcon: <CheckIcon size="5" />,
            }}
            onValueChange={value => onChange(kpi, kpi.elements_auditId, value)}
            placeholderTextColor={useColorModeValue("gray.400", "gray.50")}
            color={textColor}
            dropdownIcon={<CheckIcon size="5" color={textColor} />}
          >
            <Select.Item label="V" value="V" />
            <Select.Item label="O" value="O" />
            <Select.Item label="N" value="N" />
            <Select.Item label="G" value="G" />
          </Select>
          {kpi.ElementValue === "O" && (
            <Pressable onPress={openRemarkModal}>
              <Image
                source={require("../assets/images/baseline_note_black_24dp.png")}
                alt="Comment"
                size="xs"
              />
            </Pressable>
          )}
        </HStack>
      </VStack>
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
