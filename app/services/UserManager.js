import AsyncStorage from '@react-native-async-storage/async-storage';

const getCurrentUser = async () => {
  const response = await AsyncStorage.getItem('fdis_user_login');
  return JSON.parse(response);
};

const isLoggedIn = async () => {
  const response = await getCurrentUser();
  return response != null;
};

const setCurrentUser = async (username, password) => {
  await AsyncStorage.setItem(
    'fdis_user_login',
    JSON.stringify({username: username, password: password}),
  );
};

const logout = async () => {
  await AsyncStorage.removeItem('fdis_user_login');
};

export default {
  getCurrentUser,
  isLoggedIn,
  setCurrentUser,
  logout,
};
