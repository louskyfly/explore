import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import { ProfileSelectScreen } from '../screens/ProfileSelectScreen';
import { PinEntryScreen } from '../screens/PinEntryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { CreateActivityScreen } from '../screens/CreateActivityScreen';
import { ActivityDetailScreen } from '../screens/ActivityDetailScreen';
import { MapScreen } from '../screens/MapScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { LocationPickerScreen } from '../screens/LocationPickerScreen';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  const { theme, isDark } = useTheme();
  const { isAuthenticated } = useProfile();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: theme.background,
      card: theme.tabBar,
      text: theme.text,
      primary: theme.accent,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="ProfileSelect" component={ProfileSelectScreen} />
            <Stack.Screen
              name="PinEntry"
              component={PinEntryScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="Create"
              component={CreateActivityScreen}
              options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
            />
            <Stack.Screen name="Detail" component={ActivityDetailScreen} />
            <Stack.Screen name="Map" component={MapScreen} />
            <Stack.Screen name="Stats" component={StatsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen
              name="LocationPicker"
              component={LocationPickerScreen}
              options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
