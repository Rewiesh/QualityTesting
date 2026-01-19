/* eslint-disable react/self-closing-comp */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-alert */
/* eslint-disable no-trailing-spaces */
/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from "react";
import {
  Box,
  Center,
  Heading,
  VStack,
  Input,
  InputField,
  InputSlot,
  Button,
  ButtonText,
  ButtonSpinner,
  Image,
  Text,
  Pressable,
  HStack,
} from "@gluestack-ui/themed";
import { ShowToast } from "../services/Util";
import { StyleSheet, Platform, Dimensions, StatusBar, KeyboardAvoidingView, TextInput } from "react-native";
import userManager from "../services/UserManager";
import { fetchAuditData } from "../services/api/newAPI";
import * as database from "../services/database/database1";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");

// Custom Icon wrapper for MaterialIcons
const MIcon = ({ name, size = 16, color = "#000" }) => (
  <MaterialIcons name={name} size={size} color={color} />
);

const Login = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Colors - Blue theme like original
  const primaryColor = "#2563eb"; // Brand blue
  const primaryDark = "#1d4ed8";

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
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />
      <Box flex={1} bg="$backgroundLight50">
        {/* Top Background with Curve */}
        <Box
          bg={primaryColor}
          h="35%"
          w="$full"
          borderBottomLeftRadius="$3xl"
          borderBottomRightRadius="$3xl"
          position="absolute"
          top={0}
          shadowColor="$black"
          shadowOffset={{ width: 0, height: 5 }}
          shadowOpacity={0.2}
          shadowRadius={10}
          zIndex={1}
        >
          <Center flex={1} pb="$10">
            <Heading color="$white" fontSize="$3xl" fontWeight="$bold">
              Quality Check
            </Heading>
            <Text color="$white" fontSize="$md" opacity={0.9}>
              Audits
            </Text>
          </Center>
        </Box>

        {/* Floating Login Card */}
        <Center flex={1} px="$6" pt="20%" zIndex={2}>
          <Box
            bg="$white"
            w="$full"
            borderRadius="$2xl"
            shadowColor="$black"
            shadowOffset={{ width: 0, height: 7 }}
            shadowOpacity={0.15}
            shadowRadius={20}
            zIndex={2}
          >
            {/* Image Header */}
            <Image
              source={require("../assets/images/image_login.jpg")}
              alt="Login Header"
              h={140}
              w="$full"
              borderTopLeftRadius="$2xl"
              borderTopRightRadius="$2xl"
              resizeMode="cover"
            />

            {/* Content Container */}
            <Box p="$8">
              <VStack space="lg">
                <Box alignItems="center">
                  <Text fontSize="$2xl" fontWeight="$bold" color="$textDark800">
                    Welkom Terug
                  </Text>
                  <Text fontSize="$sm" color="$textLight500" mt="$1">
                    Log in om toegang te krijgen tot uw audits
                  </Text>
                </Box>

                <VStack space="md">
                  {/* Username Input */}
                  <VStack space="xs">
                    <Text color="$textLight500" fontSize="$xs" fontWeight="$bold" letterSpacing="$lg">
                      GEBRUIKERSNAAM
                    </Text>
                    <HStack
                      bg="$white"
                      borderColor="$borderLight200"
                      borderWidth={1}
                      borderRadius="$lg"
                      py="$2"
                      px="$3"
                      alignItems="center"
                      space="sm"
                    >
                      <MIcon name="person-outline" size={20} color="#9ca3af" />
                      <TextInput
                        style={{ flex: 1, color: '#1f2937', fontSize: 14, paddingVertical: 8 }}
                        placeholder="Voer uw gebruikersnaam in"
                        placeholderTextColor="#9ca3af"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                      />
                    </HStack>
                  </VStack>

                  {/* Password Input */}
                  <VStack space="xs">
                    <Text color="$textLight500" fontSize="$xs" fontWeight="$bold" letterSpacing="$lg">
                      WACHTWOORD
                    </Text>
                    <HStack
                      bg="$white"
                      borderColor="$borderLight200"
                      borderWidth={1}
                      borderRadius="$lg"
                      py="$2"
                      px="$3"
                      alignItems="center"
                      space="sm"
                    >
                      <MIcon name="lock-outline" size={20} color="#9ca3af" />
                      <TextInput
                        style={{ flex: 1, color: '#1f2937', fontSize: 14, paddingVertical: 8 }}
                        placeholder="Voer uw wachtwoord in"
                        placeholderTextColor="#9ca3af"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                      />
                      <Pressable onPress={() => setShowPassword(!showPassword)} p="$1">
                        <MIcon
                          name={showPassword ? "visibility" : "visibility-off"}
                          size={20}
                          color="#9ca3af"
                        />
                      </Pressable>
                    </HStack>
                  </VStack>

                  {/* Login Button */}
                  <Button
                    mt="$2"
                    onPress={loginUser}
                    isDisabled={isLoading}
                    bg={primaryColor}
                    borderRadius="$full"
                    py="$3"
                    shadowColor="$black"
                    shadowOffset={{ width: 0, height: 4 }}
                    shadowOpacity={0.2}
                    shadowRadius={8}
                    sx={{ ":active": { bg: primaryDark, transform: [{ scale: 0.98 }] } }}
                  >
                    {isLoading ? (
                      <>
                        <ButtonSpinner color="$white" mr="$2" />
                        <ButtonText color="$white" fontWeight="$bold" fontSize="$md" letterSpacing="$lg">
                          BEZIG MET INLOGGEN...
                        </ButtonText>
                      </>
                    ) : (
                      <ButtonText color="$white" fontWeight="$bold" fontSize="$md" letterSpacing="$lg">
                        INLOGGEN
                      </ButtonText>
                    )}
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
  // Kept for backward compatibility if needed
});

export default Login;
