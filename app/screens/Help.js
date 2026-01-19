/* eslint-disable react/self-closing-comp */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-alert */
/* eslint-disable no-trailing-spaces */
/* eslint-disable prettier/prettier */
import React, {useRef} from 'react';
import {View} from 'react-native';
import {WebView} from 'react-native-webview';
import { Box, HStack, Button, ButtonText } from '@gluestack-ui/themed';

const Help = () => {
  const webViewRef = useRef(null);
  const bgMain = '$backgroundLight100';

  const onNavigationStateChange = state => {
    // Handle navigation state changes here if needed
  };

  const onPrev = () => {
    webViewRef.current?.goBack();
  };

  const onNext = () => {
    webViewRef.current?.goForward();
  };

  return (
    <Box flex={1} bg={bgMain}>
      <View style={{ flex: 1 }}>
        <WebView
          ref={webViewRef}
          onNavigationStateChange={onNavigationStateChange}
          source={{
            uri: 'https://backend-quality.iccaadvies.eu/',
          }}
        />
      </View>
      <HStack h="$12" justifyContent="flex-end" alignItems="center" px="$4" space="sm">
        <Button size="sm" variant="outline" onPress={onPrev}><ButtonText>Vorige</ButtonText></Button>
        <Button size="sm" variant="outline" onPress={onNext}><ButtonText>Volgende</ButtonText></Button>
      </HStack>
    </Box>
  );
};

export default Help;
