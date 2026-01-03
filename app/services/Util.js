import {Toast, Icon, Box, HStack, Text, useColorModeValue} from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export const ShowToast = ({status, message, bgColor, textColor}) => {
  const iconProps = {
    name: status === 'success' ? 'check-circle' : 'error',
    color: status === 'success' ? 'success.500' : 'error.500',
  };

  Toast.show({
    placement: 'bottom',
    duration: 2000,
    render: () => {
      return (
        <Box bg={bgColor} px="2" py="1" rounded="sm" mb={5} mr={5}>
          <HStack space={3} alignItems="center">
            <Icon
              as={<MaterialIcons name={iconProps.name} />}
              size="sm"
              color={iconProps.color}
            />
            <Text color={textColor} fontSize="md">
              {message}
            </Text>
          </HStack>
        </Box>
      );
    },
  });
};

