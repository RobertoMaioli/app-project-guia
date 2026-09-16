import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SplashScreen } from '../screens/SplashScreen';
import { CapaScreen } from '../screens/CapaScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { CadastroScreen } from '../screens/CadastroScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MapaScreen } from '../screens/MapaScreen';
import { SalvosScreen } from '../screens/SalvosScreen';
import { PerfilScreen } from '../screens/PerfilScreen';
import { colors } from '../theme/colors';

export type RootStackParamList = {
  Splash: undefined;
  Capa: undefined;
  Login: undefined;
  Cadastro: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.forest },
      }}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Mapa" component={MapaScreen} />
      <Tab.Screen name="Salvos" component={SalvosScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen
        name="Capa"
        component={CapaScreen}
        options={{ animation: 'fade', animationDuration: 220 }}
      />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Cadastro" component={CadastroScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
    </Stack.Navigator>
  );
}
