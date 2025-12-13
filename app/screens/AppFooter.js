import React, { useState, useEffect } from 'react';
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
import { Keyboard, Platform } from 'react-native';

const AppFooter = ({ navigation }) => {
  const theme = useTheme();
  const [selected, setSelected] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Map tab names to MaterialIcon names
  const iconMap = {
    Audits: 'format-list-bulleted',
    Instellingen: 'settings',
    // Hulp: 'help-outline',
  };

  // Modern Floating Bar Colors
  const footerBg = useColorModeValue('white', 'gray.800');
  const activeColor = theme.colors.fdis[500]; // Brand Blue for active
  const inactiveColor = useColorModeValue('gray.400', 'gray.500');

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
      bg={footerBg}
      width="100%"
      safeAreaBottom
      shadow={3} // Subtle shadow for separation from content
      borderTopWidth={1}
      borderColor={useColorModeValue('gray.100', 'gray.200')}
    >
      <HStack alignItems="center" justifyContent="space-around" pt={0} pb={2}>
        {Object.keys(iconMap).map((tab, index) => {
          const isSelected = selected === index;
          return (
            <Pressable key={tab} flex={1} onPress={() => navigateToScreen(index)}>
              <Center>
                {/* Active Indicator Line */}
                <Box
                  height="3px"
                  width="50%" // Width of the indicator line
                  bg={isSelected ? activeColor : 'transparent'}
                  roundedBottom="full"
                  mb={3} // Spacing between line and icon
                />

                <VStack space={1} alignItems="center">
                  <MaterialIcons
                    name={iconMap[tab]}
                    size={26}
                    color={isSelected ? activeColor : inactiveColor}
                  />
                  <Text
                    fontSize="10px"
                    color={
                      isSelected ? activeColor : inactiveColor
                    }
                    fontWeight={isSelected ? 'bold' : 'medium'}>
                    {tab}
                  </Text>
                </VStack>
              </Center>
            </Pressable>
          );
        })}
      </HStack>
    </Box>
  );
};

export default AppFooter;
