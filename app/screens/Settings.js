import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import {
  useTheme,
  Box,
  VStack,
  Text,
  Image,
  Button,
  Icon,
  ScrollView,
  useColorMode,
  Switch,
  useColorModeValue,
} from 'native-base';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import api from '../services/api/Api';
import {fetchUserActivity} from '../services/api/Api1';
import * as database from '../services/database/database1';
import userManager from '../services/UserManager';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


const Settings = ({navigation}) => {
  const theme = useTheme();
  const [userName, setUserName] = useState('--');
  const [performedAuditsCount, setPerformedAuditsCount] = useState('');
  const [lastClientName, setLastClientName] = useState('');
  const [lastLocationName, setLastLocationName] = useState('');
  const [picture, setPicture] = useState('');
  const [selectedPicture, setSelectedPicture] = useState('');
  const {colorMode, toggleColorMode} = useColorMode();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await userManager.getCurrentUser();
        setUserName(user.username);
        const activity = await fetchUserActivity(user.username, user.password);
        await database.insertSettings(
          activity.data.performedAuditsCount,
          activity.data.lastClientName,
          activity.data.lastClientLocationName,
        );
        const settings = await database.getSettings();
        setPerformedAuditsCount(settings.auditExecuted);
        setLastClientName(settings.lastClient);
        setLastLocationName(settings.lastLocationVisited);
        setPicture(settings.picture);
        setSelectedPicture(getImageSource());
        console.log('getImageSource() ' + getImageSource());
      } catch (error) {
        console.log(error);
      }

      console.log('performedAuditsCount => ' + performedAuditsCount);
      console.log('performedAuditsCount => ' + lastClientName);
      console.log('performedAuditsCount => ' + lastLocationName);
      console.log('picture' + picture);
    };

    fetchUserData();
  }, [picture]);


  const getImageSource = () => {
    console.log(' getImageSource ' + picture);
    console.log(' {uri: picture} ' + {uri: picture});

    if (picture != null) {
      return {uri: picture};
    } else {
      return require('../assets/images/photo.png');
    }
  };  

  const onSelectPicture = async picture => {
    console.log('Selected file path:', picture);
    await database.insertPicture(picture); // Update database
    setPicture(picture); // Update local state to reflect new picture
    setSelectedPicture(getImageSource);
  };  

  const updateUserSettings = async () => {
    const userSettings = await database.getSettings();
    const savedUserSettings = {
      auditExecuted: '10',
      lastClient: 'rew',
      lastLocationVisited: 'rewiesh',
      picture: 'null',
    };
    await database.insertSettings(
      savedUserSettings.auditExecuted,
      savedUserSettings.lastClient,
      savedUserSettings.lastLocationVisited,
    );
    const settings = await database.getSettings();   
    console.log('picture' + picture);

    console.log(settings);
  };

  const logOffUser = () => {
    Promise.all([userManager.logout(), database.clearSettings()]).then(() => {
      navigation.navigate('Login');
    });
  };  
  
  return (
    <ScrollView bg={useColorModeValue('white', theme.colors.fdis[800])}>
      <VStack space={5} alignItems="center" mt="4" mb="6">
        {/* <PicturePicker
          userName={userName}
          onSelectPicture={onSelectPicture}
          selectedPicture={selectedPicture}
        /> */}
        {/* <ThemeToggle
          colorMode={colorMode}
          toggleColorMode={toggleColorMode}
          updateUserSettings={updateUserSettings}
        /> */}
        <SettingsOption
          title="Uitgevoerde Audits"
          description={`Totaal uitgevoerde audits: ${performedAuditsCount}`}
        />
        <SettingsOption
          title="Laatste Klant"
          description={`Meest recente klant: ${lastClientName}`}
        />
        <SettingsOption
          title="Laatste Locatie"
          description={`Laatst bezochte locatie: ${lastLocationName}`}
        />
        <Button
          colorScheme="coolGray"
          onPress={logOffUser}
          startIcon={<Icon as={MaterialIcons} name="logout" size="sm" />}
          bg={useColorModeValue(theme.colors.fdis[400], theme.colors.fdis[600])}
          _text={{color: 'white'}}>
          Log Out
        </Button>
      </VStack>
    </ScrollView>
  );
};

const SettingsOption = ({title, description}) => {
  return (
    <VStack space={2} alignItems="center" w="90%">
      <Text
        fontSize="md"
        bold
        color={useColorModeValue('coolGray.800', 'coolGray.50')}>
        {title}
      </Text>
      <Text
        color={useColorModeValue('gray.500', 'gray.200')}
        textAlign="center">
        {description}
      </Text>
    </VStack>
  );
};

const ThemeToggle = ({colorMode, toggleColorMode, updateUserSettings}) => {
  const theme = useTheme();

  return (
    <VStack space={4} alignItems="center">
      <Text
        fontSize="md"
        bold
        color={useColorModeValue('coolGray.800', 'coolGray.50')}>
        Schakel tussen donkere/lichte thema
      </Text>
      <Switch
        isChecked={colorMode === 'light'}
        onToggle={toggleColorMode}
        onTrackColor={theme.colors.fdis[300]}
        offTrackColor={theme.colors.fdis[600]}
      />
    </VStack>
  );
};

const PicturePicker = ({
  userName,
  getImageSource,
  onSelectPicture,
  selectedPicture,
}) => {
  const theme = useTheme();

  const chooseFile = () => {
    Alert.alert(
      'Add Photo',
      'Choose from',
      [
        {
          text: 'Gallery',
          onPress: () => launchImagePicker('gallery'),
        },
        {
          text: 'Camera',
          onPress: () => launchImagePicker('camera'),
        },
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
      ],
      {cancelable: true},
    );
  };

  const launchImagePicker = type => {
    let options = {
      mediaType: 'photo',
      saveToPhotos: true,
    };
    if (type === 'gallery') {
      launchImageLibrary(options, response => {
        handleImageResponse(response);
      });
    } else if (type === 'camera') {
      launchCamera(options, response => {
        handleImageResponse(response);
      });
    }
  };

  const handleImageResponse = response => {
    console.log('Response = ', response);

    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.error) {
      console.log('ImagePicker Error: ', response.error);
    } else if (response.assets && response.assets.length > 0) {
      const selectedImage = response.assets[0];
      onSelectPicture(selectedImage.uri);
    } else {
      console.log('No image selected');
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <Box flex={1} alignItems="center">
        <TouchableOpacity activeOpacity={0.5} onPress={chooseFile}>
          <Image
            source={selectedPicture}
            alt="Profile"
            size="xl"
            borderRadius="full"
            borderColor={theme.colors.fdis[500]}
            borderWidth={3}
            width="150px"
            height="150px"
            resizeMode="cover"
          />
        </TouchableOpacity>
        <Text
          fontSize="xl"
          bold
          mt="2"
          color={useColorModeValue('coolGray.800', 'coolGray.50')}>
          {userName}
        </Text>
      </Box>
    </SafeAreaView>
  );
};

export default Settings;