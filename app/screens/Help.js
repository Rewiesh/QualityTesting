import React, {useRef} from 'react';
import {View, Button, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';

const Help = () => {
  const webViewRef = useRef(null);

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
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        onNavigationStateChange={onNavigationStateChange}
        source={{
          uri: 'https://backend-quality.iccaadvies.eu/',
        }}
      />
      <View style={styles.navigationContainer}>
        <Button title="Prev" onPress={onPrev} style={styles.button} />
        <Button title="Next" onPress={onNext} style={styles.button} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    flexDirection: 'column',
  },
  navigationContainer: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  button: {
    flex: 1,
  },
});

export default Help;
