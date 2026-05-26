import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CitizenHomeScreen from '../screens/citizen/CitizenHomeScreen';
import CitizenQRScreen from '../screens/citizen/CitizenQRScreen';
import CitizenHistoryScreen from '../screens/citizen/CitizenHistoryScreen';
import CitizenLeaderboardScreen from '../screens/citizen/CitizenLeaderboardScreen';
import CitizenOffersScreen from '../screens/citizen/CitizenOffersScreen';

const Stack = createStackNavigator();

export default function CitizenNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CitizenHome" component={CitizenHomeScreen} />
      <Stack.Screen name="CitizenQR" component={CitizenQRScreen} />
      <Stack.Screen name="CitizenHistory" component={CitizenHistoryScreen} />
      <Stack.Screen name="CitizenLeaderboard" component={CitizenLeaderboardScreen} />
      <Stack.Screen name="CitizenOffers" component={CitizenOffersScreen} />
    </Stack.Navigator>
  );
}
