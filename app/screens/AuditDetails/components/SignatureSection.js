/* eslint-disable prettier/prettier */
import React from "react";
import { View } from "react-native";
import { Box, Text, HStack, Center, Icon, Button, Image } from "native-base";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Signature from "react-native-signature-canvas";

const signatureStyle = `.m-signature-pad--footer { display: none; margin: 0px; }
  .m-signature-pad { box-shadow: none; border: none; }
  .m-signature-pad--body { border: none; }
  body,html { width: 100%; height: 100%; }`;

const SignatureSection = ({
  signature,
  signatureSaved,
  signatureRef,
  handleSignature,
  handleClearSignature,
  saveSignature,
  disableScroll,
  enableScroll,
  cardBg,
  headingTextColor,
}) => {
  return (
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
              onTouchStart={disableScroll}
              onTouchEnd={enableScroll}
              onTouchCancel={enableScroll}
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
  );
};

export default SignatureSection;
