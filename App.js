// App.js
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import 'react-native-gesture-handler'; // ← ajouter cette ligne en tout premier

import AjouterScreen from './src/screens/AjouterScreen';
import DetailScreen from './src/screens/DetailScreen';
import HomeScreen from './src/screens/HomeScreen';
import ListeScreen from './src/screens/ListeScreen';
import StatsScreen from './src/screens/StatsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle:      { backgroundColor: '#0d0d1a' },
          headerTintColor:  '#f0f0ff',
          headerTitleStyle: { fontWeight: 'bold' },
          cardStyle:        { backgroundColor: '#0d0d1a' },
        }}
      >
        <Stack.Screen name="Home"    component={HomeScreen}
          options={{ title: 'GestEmployé' }} />
        <Stack.Screen name="Liste"   component={ListeScreen}
          options={{ title: 'Liste des Employés' }} />
        <Stack.Screen name="Ajouter" component={AjouterScreen}
          options={{ title: 'Ajouter un Employé' }} />
        <Stack.Screen name="Detail"  component={DetailScreen}
          options={{ title: 'Détail Employé' }} />
        <Stack.Screen name="Stats"   component={StatsScreen}
          options={{ title: 'Statistiques' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
