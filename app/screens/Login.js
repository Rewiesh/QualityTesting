/* eslint-disable react/self-closing-comp */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-alert */
/* eslint-disable no-trailing-spaces */
/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from "react";
import {
  useTheme,
  Box,
  Center,
  Heading,
  VStack,
  FormControl,
  Input,
  Button,
  Image,
  useColorModeValue,
  Text,
  Icon,
  Pressable,
  KeyboardAvoidingView,
  HStack,
  StatusBar,
} from "native-base";
import { ShowToast } from "../services/Util";
import { StyleSheet, Platform, Dimensions } from "react-native";
import userManager from "../services/UserManager";
import { fetchAuditData } from "../services/api/newAPI";
import * as database from "../services/database/database1";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");

const Login = ({ navigation }) => {
  const theme = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Colors
  const primaryColor = theme.colors.fdis[500]; // Brand Blue
  const primaryDark = theme.colors.fdis[700];
  const bgColor = useColorModeValue("coolGray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("coolGray.800", "white");
  const mutedText = useColorModeValue("coolGray.500", "gray.400");
  const inputBg = useColorModeValue("coolGray.50", "gray.700");
  const borderColor = useColorModeValue("coolGray.200", "gray.600");

  useEffect(() => {
    const redirectUser = async () => {
      try {
        const isLoggedIn = await userManager.isLoggedIn();
        if (isLoggedIn) {
          navigation.replace("MyTabs");
        }
      } catch (error) {
        console.error("Error Occurred: ", error);
      }
    };

    redirectUser();
  }, []);

  const loginUser = async () => {
    if (!username || !password) {
      ShowToast({
        status: "warning",
        message: "Vul alstublieft uw gebruikersnaam en wachtwoord in.",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("username", username);

      const { data, error } = await fetchAuditData(username, password);

      if (error) {
        console.log("Login error:", error);
        ShowToast({
          status: "error",
          message: "Ongeldige inloggegevens.",
        });
        return;
      }

      console.log("Login successful!");
      await database.InitializeDatabase();

      if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
        await database.saveAllData(data);
      } else {
        console.log("Geen data om op te slaan.");
      }

      userManager.setCurrentUser(username, password);
      navigation.replace("MyTabs");
    } catch (error) {
      console.error("Error during login:", error);
      ShowToast({
        status: "error",
        message: "Er ging iets mis tijdens het inloggen.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      flex={1}
    >
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />
      <Box flex={1} bg={bgColor}>
        {/* Top Blue Background with Curve */}
        <Box
          bg={primaryColor}
          height="35%"
          width="100%"
          borderBottomLeftRadius="3xl"
          borderBottomRightRadius="3xl"
          position="absolute"
          top={0}
          shadow={5}
          zIndex={1}
        >
          <Center flex={1} pb={10}>
            {/* Optional: Add Logo here later if needed, or keep clean */}
            <Heading color="white" fontSize="3xl" fontWeight="bold">
              Quality Check
            </Heading>
            <Text color="white" fontSize="md" opacity={0.9}>
              Audits
            </Text>
          </Center>
        </Box>

        {/* Floating Login Card */}
        <Center flex={1} px={6} pt="20%" zIndex={2}>
          <Box
            bg={cardBg}
            width="100%"
            rounded="2xl"
            shadow={7} // Deep shadow for premium feel
            zIndex={2}
          >
            {/* Image Header */}
            <Image
              source={require("../assets/images/image_login.jpg")}
              alt="Login Header"
              height={140}
              width="100%"
              borderTopLeftRadius="2xl"
              borderTopRightRadius="2xl"
              resizeMode="cover"
            />

            {/* Content Container */}
            <Box p={8}>
              <VStack space={6}>
                <Box alignItems="center">
                  <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                    Welkom Terug
                  </Text>
                  <Text fontSize="sm" color={mutedText} mt={1}>
                    Log in om toegang te krijgen tot uw audits
                  </Text>
                </Box>

                <VStack space={4}>
                  <FormControl>
                    <FormControl.Label _text={{ color: mutedText, fontSize: "xs", fontWeight: "bold", letterSpacing: 1 }}>
                      GEBRUIKERSNAAM
                    </FormControl.Label>
                    <Input
                      InputLeftElement={
                        <Icon
                          as={<MaterialIcons name="person-outline" />}
                          size={5}
                          ml="3"
                          color="coolGray.400"
                        />
                      }
                      bg={useColorModeValue("white", "gray.700")}
                      variant="outline"
                      borderColor={borderColor}
                      borderWidth={1}
                      placeholder="Voer uw gebruikersnaam in"
                      placeholderTextColor="coolGray.400"
                      value={username}
                      onChangeText={setUsername}
                      color={textColor}
                      py="3"
                      fontSize="sm"
                      rounded="lg"
                      _focus={{
                        borderColor: primaryColor,
                        bg: useColorModeValue("white", "gray.700"),
                        _android: { selectionColor: primaryColor },
                        _ios: { selectionColor: primaryColor }
                      }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormControl.Label _text={{ color: mutedText, fontSize: "xs", fontWeight: "bold", letterSpacing: 1 }}>
                      WACHTWOORD
                    </FormControl.Label>
                    <Input
                      InputLeftElement={
                        <Icon
                          as={<MaterialIcons name="lock-outline" />}
                          size={5}
                          ml="3"
                          color="coolGray.400"
                        />
                      }
                      InputRightElement={
                        <Pressable onPress={() => setShowPassword(!showPassword)} p={2}>
                          <Icon
                            as={<MaterialIcons name={showPassword ? "visibility" : "visibility-off"} />}
                            size={5}
                            mr="2"
                            color="coolGray.400"
                          />
                        </Pressable>
                      }
                      bg={useColorModeValue("white", "gray.700")}
                      variant="outline"
                      borderColor={borderColor}
                      borderWidth={1}
                      placeholder="Voer uw wachtwoord in"
                      placeholderTextColor="coolGray.400"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChangeText={setPassword}
                      color={textColor}
                      py="3"
                      fontSize="sm"
                      rounded="lg"
                      _focus={{
                        borderColor: primaryColor,
                        bg: useColorModeValue("white", "gray.700"),
                        _android: { selectionColor: primaryColor },
                        _ios: { selectionColor: primaryColor }
                      }}
                    />
                  </FormControl>

                  <Button
                    mt="2"
                    onPress={loginUser}
                    isLoading={isLoading}
                    isLoadingText="Bezig met inloggen..."
                    bg={primaryColor}
                    rounded="full" // Pill shape
                    shadow={4}
                    py="3"
                    _pressed={{
                      bg: primaryDark,
                      transform: [{ scale: 0.98 }]
                    }}
                    _text={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "md",
                      textTransform: "uppercase",
                      letterSpacing: 1
                    }}
                  >
                    Inloggen
                  </Button>
                </VStack>
              </VStack>
            </Box>
          </Box>
        </Center>
      </Box>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  // Kept for backward compatibility if needed, but styling moved to NativeBase props
});

export default Login;
