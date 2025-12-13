import React from 'react';
import { useColorModeValue, useTheme } from 'native-base';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

//screens
import Login from './screens/Login';
import Clients from './screens/Clients';
import Settings from './screens/Settings';
import Help from './screens/Help';
import Audits from './screens/Audits';
import AuditDetails from './screens/AuditDetails';
import AuditPersonList from './screens/AuditPersonList';
import AuditForm from './screens/AuditForm';
import AuditResumeForm from './screens/AuditResumeForm';
import AuditErrorList from './screens/AuditErrorList';
import AuditErrorForm from './screens/AuditErrorForm';
import AppFooter from './screens/AppFooter';
import FailedUploads from './screens/FailedUploads';

const AuditsStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuditsStackScreen() {
  const theme = useTheme();
  const headerBackground = useColorModeValue(
    theme.colors.fdis[400], // Darker shade for light mode
    theme.colors.fdis[900], // Dark background for dark mode
  );

  const headerTintColor = 'white';

  return (
    <AuditsStack.Navigator
      screenOptions={{
        animation: 'slide_from_right',
        headerShown: true,
        headerShadowVisible: false, // Remove shadow for flat look
        headerTitleAlign: 'center', // Center title for premium feel
        headerStyle: {
          backgroundColor: headerBackground, // Using theme color based on light/dark mode
        },
        headerTintColor: headerTintColor, // Text and icon color based on light/dark mode
        headerTitleStyle: {
          fontWeight: '700', // Slightly bolder but cleaner
          fontSize: 20,
        },
      }}>
      <AuditsStack.Screen name="Opdrachtgever" component={Clients} />
      <AuditsStack.Screen name="Audits" component={Audits} />
      <AuditsStack.Screen name="Mislukte Uploads" component={FailedUploads} />
      <AuditsStack.Screen name="Audit Details" component={AuditDetails} />
      <AuditsStack.Screen name="Audit Formulier" component={AuditForm} />
      <AuditsStack.Screen
        name="Uitgevoerde Audit"
        component={AuditResumeForm}
      />
      <AuditsStack.Screen name="Fouten Lijst" component={AuditErrorList} />
      <AuditsStack.Screen name="Opmerkingen" component={AuditErrorForm} />
      <AuditsStack.Screen name="Aanwezig bij Audit" component={AuditPersonList}
      />
    </AuditsStack.Navigator>
  );
}

function MyTabs() {
  const theme = useTheme();
  const headerBackground = useColorModeValue(
    theme.colors.fdis[400], // Darker shade for light mode
    theme.colors.fdis[900], // Dark background for dark mode
  );

  const headerTintColor = 'white';

  const commonHeaderOptions = {
    animation: 'slide_from_right',
    headerShown: true,
    headerShadowVisible: false,
    headerTitleAlign: 'center',
    headerStyle: {
      backgroundColor: headerBackground,
    },
    headerTintColor: headerTintColor,
    headerTitleStyle: {
      fontWeight: '700',
      fontSize: 20, // Increased font size slightly to match SS1
    },
  };

  return (
    <Tab.Navigator tabBar={props => <AppFooter {...props} />}>
      <Tab.Screen
        name="AuditsTab"
        component={AuditsStackScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Instellingen"
        component={Settings}
        options={commonHeaderOptions}
      />
      <Tab.Screen
        name="Hulp"
        component={Help}
        options={commonHeaderOptions}
      />
    </Tab.Navigator>
  );
}

export default function FdisQuality() {
  return (
    <NavigationContainer>
      <AuditsStack.Navigator screenOptions={{ headerShown: false }}>
        <AuditsStack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <AuditsStack.Screen name="MyTabs" component={MyTabs} />
      </AuditsStack.Navigator>
    </NavigationContainer>
  );
}
