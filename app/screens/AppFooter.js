import React, { useState, useEffect } from 'react';
import { Box, Text, VStack, HStack, Center, Pressable } from '@gluestack-ui/themed';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Keyboard, Platform } from 'react-native';

// FDIS amber color
const FDIS_COLOR = '#f59e0b';

const AppFooter = ({ navigation }) => {
  const [selected, setSelected] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Map tab names to MaterialIcon names
  const iconMap = {
    Audits: 'format-list-bulleted',
    Instellingen: 'settings',
    // Hulp: 'help-outline',
  };

  // Modern Floating Bar Colors
  const footerBg = '$white';
  const activeColor = FDIS_COLOR;
  const inactiveColor = '#9ca3af';

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
      pb="$6"
      shadowColor="$black"
      shadowOffset={{ width: 0, height: -2 }}
      shadowOpacity={0.1}
      shadowRadius={3}
      borderTopWidth={1}
      borderColor="$borderLight100"
    >
      <HStack alignItems="center" justifyContent="space-around" pt="$0" pb="$2">
        {Object.keys(iconMap).map((tab, index) => {
          const isSelected = selected === index;
          return (
            <Pressable key={tab} flex={1} onPress={() => navigateToScreen(index)}>
              <Center>
                {/* Active Indicator Line */}
                <Box
                  height={3}
                  width="50%"
                  bg={isSelected ? activeColor : 'transparent'}
                  borderBottomLeftRadius="$full"
                  borderBottomRightRadius="$full"
                  mb="$3"
                />

                <VStack space="xs" alignItems="center">
                  <MaterialIcons
                    name={iconMap[tab]}
                    size={26}
                    color={isSelected ? activeColor : inactiveColor}
                  />
                  <Text
                    fontSize={10}
                    color={isSelected ? activeColor : inactiveColor}
                    fontWeight={isSelected ? '$bold' : '$medium'}>
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
