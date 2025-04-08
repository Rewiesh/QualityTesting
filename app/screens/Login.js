/* eslint-disable react/self-closing-comp */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-alert */
/* eslint-disable no-trailing-spaces */
/* eslint-disable prettier/prettier */
import React, {useState, useEffect} from 'react';
import {
  useTheme,
  colorMode,
  Box,
  Center,
  Heading,
  Spinner,
  VStack,
  FormControl,
  Input,
  Button,
  Image,
  useColorModeValue,
  Text,
} from 'native-base';
import {ShowToast} from '../services/Util';
import {StyleSheet} from 'react-native';
import userManager from '../services/UserManager';
import {fetchData} from '../services/api/Api1';
import {isLoginValid, fetchToken, fetchAuditData} from '../services/api/newAPI';
import * as database from '../services/database/database1';

const Login = ({navigation}) => {
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bgColor = useColorModeValue('coolGray.100', 'gray.700');
  const textColor = useColorModeValue('darkText', 'lightText');

  useEffect(() => {
    const redirectUser = async () => {
      try {
        const isLoggedIn = await userManager.isLoggedIn();
        if (isLoggedIn) {
          navigation.replace('MyTabs');
        }
      } catch (error) {
        console.error('Error Occurred: ', error);
      }
    };

    redirectUser();
  }, []);

  // const loginUser = async () => {
  //   setIsLoading(true);
  //   try {
  //     const {data, error} = await fetchData(username, password);
  //     if (error) {
  //       // Using NativeBase Toast to show error
  //       ShowToast({
  //         status: 'error',
  //         message: 'Ongeldige inloggegevens.',
  //         bgColor: bgColor,
  //         textColor: textColor,
  //       });
  //     } else {
  //       await database.InitializeDatabase(); // Ensure database is initialized before proceeding
  //       await database.saveAllData(data); // Save all data to the database
  //       userManager.setCurrentUser(username, password); // Set the current user
  //       navigation.replace('MyTabs'); // Navigate to 'MyTabs'
  //     }
  //   } catch (error) {
  //     console.error('Error during login:', error);
  //   } finally {
  //     setIsLoading(false); // Reset loading state irrespective of success/failure
  //   }
  // };

  const loginUser = async () => {
    setIsLoading(true);
    try {
      console.log('username', username);
      console.log('password', password);
  
      const { data, error } = await fetchAuditData(username, password);
  
      if (error) {
        console.log('Login error:', error);
        ShowToast({
          status: 'error',
          message: 'Ongeldige inloggegevens.',
          bgColor,
          textColor,
        });
        return; // Stop verder uitvoeren
      }
  
      console.log('Login successful!');
  
      await database.InitializeDatabase();
  
      if (data && Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0) {
        await database.saveAllData(data);
      } else {
        console.log('Geen data om op te slaan.');
      }
  
      userManager.setCurrentUser(username, password);
      navigation.replace('MyTabs');
    } catch (error) {
      console.error('Error during login:', error);
      ShowToast({
        status: 'error',
        message: 'Er ging iets mis tijdens het inloggen.',
        bgColor,
        textColor,
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  if (isLoading) {
    return (
      <Center flex={1} bg={useColorModeValue('white', theme.colors.fdis[900])}>
        <Spinner
          size="lg"
          color={useColorModeValue(theme.colors.fdis[400], 'white')}
          accessibilityLabel="Klanten worden opgehaald"
        />
        <Text
          color={useColorModeValue(theme.colors.fdis[400], 'white')}
          fontSize="md">
          Klanten worden opgehaald...
        </Text>
      </Center>
    );
  }

  return (
    <Center
      w="100%"
      h="100%"
      bg={useColorModeValue('white', theme.colors.fdis[900])}>
      <Box safeArea p="5" w="90%" maxW="350">
        <Heading
          size="xl"
          fontWeight="600"
          color={useColorModeValue(theme.colors.fdis[400], 'white')}>
          Inloggen
        </Heading>
        <Text
          fontSize="md"
          mt="1"
          color={useColorModeValue('black', 'white')}
          fontWeight="medium">
          Welkom terug, log alstublieft in om verder te gaan.
        </Text>
        <Image
          source={require('../assets/images/image_login.jpg')}
          alt="Login Image"
          size="2xl"
          resizeMode="contain"
          style={styles.headerImage}
        />
        <VStack space={4} mt="5">
          <FormControl>
            <FormControl.Label color={useColorModeValue('black', 'white')}>
              Gebruikersnaam
            </FormControl.Label>
            <Input
              bg={useColorModeValue('white', 'gray.700')}
              placeholder="Gebruikersnaam invoeren"
              placeholderTextColor={useColorModeValue('black', 'white')}
              value={username}
              onChangeText={setUsername}
              color={useColorModeValue('black', 'white')}
              borderColor={useColorModeValue(theme.colors.fdis[100], 'white')}
              _focus={{
                borderColor: 'fdis.500',
              }}
            />
          </FormControl>
          <FormControl>
            <FormControl.Label color={useColorModeValue('black', 'white')}>
              Wachtwoord
            </FormControl.Label>
            <Input
              bg={useColorModeValue('white', 'gray.700')}
              placeholder="Wachtwoord invoeren"
              placeholderTextColor={useColorModeValue('black', 'white')}
              color={useColorModeValue('black', 'white')}
              borderColor={useColorModeValue(theme.colors.fdis[100], 'white')}
              type="password"
              value={password}
              onChangeText={setPassword}
              _focus={{borderColor: theme.colors.fdis[500]}}
            />
          </FormControl>
          <Button
            mt="2"
            onPress={loginUser}
            bg={useColorModeValue(
              theme.colors.fdis[400],
              theme.colors.fdis[600],
            )}
            _text={{color: 'white'}}>
            Inloggen
          </Button>
        </VStack>
      </Box>
    </Center>
  );
};

const styles = StyleSheet.create({
  headerImage: {
    alignSelf: 'center',
    width: 280,
    height: 150,
    marginTop: 20,
  },
});

export default Login;
