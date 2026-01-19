/* eslint-disable prettier/prettier */
import React from "react";
import { View } from "react-native";
import { Box, Text, HStack, Center, Button, ButtonText, Image } from "@gluestack-ui/themed";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const MIcon = ({ name, size = 16, color = "#000" }) => (
  <MaterialIcons name={name} size={size} color={color} />
);
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
    <Box bg={cardBg} borderRadius="$2xl" shadowColor="$black" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.15} shadowRadius={3} mt="$4" overflow="hidden">
      <Box px="$4" py="$3" borderBottomWidth={1} borderColor="$borderLight100">
        <HStack alignItems="center" space="sm">
          <Center bg="$green100" w="$8" h="$8" borderRadius="$lg">
            <MIcon name="draw" size={16} color="#16a34a" />
          </Center>
          <Text fontSize="$md" fontWeight="$bold" color={headingTextColor}>
            Handtekening
          </Text>
          {signatureSaved && (
            <Box bg="$green100" px="$2" py="$0.5" borderRadius="$full" ml="auto">
              <Text fontSize="$2xs" fontWeight="$bold" color="#16a34a">Opgeslagen</Text>
            </Box>
          )}
        </HStack>
      </Box>
      
      <Box p="$4">
        {signature ? (
          <Box bg="$backgroundLight50" borderRadius="$xl" overflow="hidden" borderWidth={1} borderColor="$borderLight200">
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
          <Box bg="$backgroundLight50" borderRadius="$xl" overflow="hidden" borderWidth={1} borderColor="$borderLight200">
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

        <HStack space="md" mt="$4">
          <Button
            flex={1}
            variant="outline"
            borderColor="$borderLight300"
            borderRadius="$xl"
            onPress={handleClearSignature}
          >
            <HStack alignItems="center" space="xs">
              <MIcon name="clear" size={16} color="#6b7280" />
              <ButtonText color="$textLight600">Wissen</ButtonText>
            </HStack>
          </Button>
          <Button
            flex={1}
            bg="$amber500"
            borderRadius="$xl"
            onPress={saveSignature}
            isDisabled={!!signature}
          >
            <HStack alignItems="center" space="xs">
              <MIcon name="save" size={16} color="#fff" />
              <ButtonText color="$white">Opslaan</ButtonText>
            </HStack>
          </Button>
        </HStack>
      </Box>
    </Box>
  );
};

export default SignatureSection;
