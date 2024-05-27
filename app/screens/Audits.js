import React, {useState, useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {
  Box,
  HStack,
  Text,
  Pressable,
  FlatList,
  VStack,
  useTheme,
  useColorModeValue,
} from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as database from '../services/database/database1';
import userManager from '../services/UserManager';

const Audits = ({route, navigation}) => {
  const theme = useTheme();
  const [auditsList, setAuditsList] = useState([]);
  const [user, setUser] = useState({});
  const {clientName} = route.params;

  useFocusEffect(
    useCallback(() => {
      const updateList = async () => {
        try {
          const auditsData = await database.getAuditsOfClient(clientName);
          const userData = await userManager.getCurrentUser();
          setAuditsList(auditsData);
          setUser(userData);
          console.log(userData);
          console.log(auditsData);
        } catch (error) {
          console.error('Failed to fetch audits:', error);
          alert('Failed to load audits. Error: ' + error.message);
        }
      };

      updateList();
    }, [clientName]),
  );

  const onAuditClick = audit => {
    navigation.navigate('Audit Details', {
      AuditId: audit.Id,
      clientName: clientName,
      user: user,
    });
  };

  const styles = {
    listBackgroundColor: useColorModeValue('white', theme.colors.fdis[800]),
    bgColor: useColorModeValue('coolGray.100', theme.colors.fdis[700]),
    pressedColor: useColorModeValue('coolGray.200', theme.colors.fdis[700]),
    borderColor: useColorModeValue(
      theme.colors.fdis[300],
      theme.colors.fdis[700],
    ),
    textColor: useColorModeValue('black', 'white'),
  };

  const getIconName = audit => {
    if (audit.hasIssue) return 'report-problem';
    if (audit.isComplete) return 'check-circle';
    if (audit.hasHistory) return 'history';
    if (audit.canEdit) return 'edit';
    if (audit.isAssigned) return 'assignment';
    return 'visibility'; // Default icon
  };

  const renderAuditRow = ({item}) => (
    <Pressable onPress={() => onAuditClick(item)}>
      {({isHovered, isPressed}) => (
        <Box
          borderBottomWidth="1"
          py="3"
          borderColor={styles.borderColor}
          bg={isPressed ? styles.pressedColor : styles.bgColor}
          px="4"
          style={{transform: [{scale: isPressed ? 0.96 : 1}]}}>
          <HStack justifyContent="space-between" alignItems="center">
            <VStack space={1}>
              <Text
                bold
                color={styles.textColor}
                fontSize="md"
                _dark={{color: 'warmGray.50'}}>
                {item.isUnSaved ? item.isUnSaved : ''}
                {item.AuditCode}
              </Text>
              <Text note fontSize="xs" color={styles.textColor}>
                {item.LocationClient}
              </Text>
            </VStack>
            <MaterialIcons
              name="assignment"
              size={24}
              color={styles.textColor} // Ensuring the icon matches the text color
            />
          </HStack>
        </Box>
      )}
    </Pressable>
  );


  return (
    <Box flex={1} bg={styles.listBackgroundColor}>
      <FlatList
        data={auditsList}
        renderItem={renderAuditRow}
        keyExtractor={item => item.Id.toString()}
      />
    </Box>
  );
};

export default Audits;
