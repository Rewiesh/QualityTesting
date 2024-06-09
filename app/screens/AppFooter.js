import React, {useState, useEffect} from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Center,
  Pressable,
  useColorModeValue,
  useTheme,
} from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Keyboard} from 'react-native';

const AppFooter = ({navigation}) => {
  const theme = useTheme();
  const [selected, setSelected] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Map tab names to MaterialIcon names
  const iconMap = {
    Audits: 'format-list-bulleted',
    Instellingen: 'settings',
    // Hulp: 'help-outline',
  };

  const footerBackground = useColorModeValue(
    theme.colors.fdis[400], // Darker shade for light mode
    theme.colors.fdis[900], // Dark background for dark mode
  );
  const activeIconColor = useColorModeValue(
    'black', 
    'white'
  );
  const inactiveIconColor = useColorModeValue(
    'black', // Black color for inactive icon in light mode
    theme.colors.fdis[600], // Dark color for inactive icon in dark mode
  );


  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const navigateToScreen = selectedIndex => {
    const screenNames = ['AuditsTab', 'Instellingen', 'Hulp'];
    setSelected(selectedIndex);
    navigation.navigate(screenNames[selectedIndex]);
  };

  if (keyboardVisible) {
    return null;
  }    

  return (
    <Box
      bg={footerBackground}
      safeAreaBottom
      width="100%"
      position="absolute"
      bottom="0"
      alignSelf="center"
      shadow={2}>
      <HStack alignItems="center" justifyContent="space-around" py="2">
        {Object.keys(iconMap).map((tab, index) => (
          <Pressable key={tab} flex={1} onPress={() => navigateToScreen(index)}>
            <Center>
              <VStack space={1} alignItems="center">
                <MaterialIcons
                  name={iconMap[tab]}
                  size={selected === index ? 24 : 20}
                  color={
                    selected === index ? activeIconColor : inactiveIconColor
                  }
                />
                <Text
                  fontSize="sm"
                  color={
                    selected === index ? activeIconColor : inactiveIconColor
                  }
                  fontWeight={selected === index ? 'bold' : 'normal'}>
                  {tab}
                </Text>
              </VStack>
            </Center>
          </Pressable>
        ))}
      </HStack>
    </Box>
  );
};

export default AppFooter;
