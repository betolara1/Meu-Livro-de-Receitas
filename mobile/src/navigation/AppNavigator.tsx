import React from 'react';
import { View, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { AuthLoadingScreen } from '../components/AuthLoadingScreen';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { StackScreenWithFAB } from '../components/StackScreenWithFAB';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import CreateRecipeScreen from '../screens/CreateRecipeScreen';
import EditRecipeScreen from '../screens/EditRecipeScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  RecipeDetail: { recipeId: string };
  CreateRecipe: undefined;
  EditRecipe: { recipeId: string };
};

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Favorites: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Componentes nomeados para evitar warnings de performance
const RecipeDetailScreenWrapper = ({ navigation }: any) => (
  <StackScreenWithFAB onFABPress={() => navigation.navigate('CreateRecipe')}>
    <RecipeDetailScreen />
  </StackScreenWithFAB>
);

const CreateRecipeScreenWrapper = ({ navigation }: any) => (
  <StackScreenWithFAB onFABPress={() => navigation.navigate('CreateRecipe')}>
    <CreateRecipeScreen />
  </StackScreenWithFAB>
);

const EditRecipeScreenWrapper = ({ navigation }: any) => (
  <StackScreenWithFAB onFABPress={() => navigation.navigate('CreateRecipe')}>
    <EditRecipeScreen />
  </StackScreenWithFAB>
);

const TabNavigator = ({ navigation, route }: any) => {
  const { user } = useAuth();

  const handleFABPress = () => {
    navigation.navigate('CreateRecipe');
  };

  // Ocultar FAB na tela de perfil
  const shouldShowFAB = route?.state?.index !== 3; // Profile é o 4º tab (índice 3)

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Profile') {
            // Ícone personalizado para o perfil com foto do usuário
            return (
              <View style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: focused ? Colors.primary : Colors.primaryLight,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: focused ? 2 : 0,
                borderColor: Colors.primary,
              }}>
                {user?.photo ? (
                  <Image 
                    source={{ uri: user.photo }} 
                    style={{
                      width: size - 4,
                      height: size - 4,
                      borderRadius: (size - 4) / 2,
                    }}
                  />
                ) : (
                  <Ionicons 
                    name="person" 
                    size={size * 0.6} 
                    color={focused ? Colors.background : Colors.primary} 
                  />
                )}
              </View>
            );
          }

          let iconName: keyof typeof Ionicons.glyphMap;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else {
            iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: Colors.background,
          borderBottomColor: Colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: 'Início',
          headerTitle: 'Livro de Receitas'
        }} 
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{ 
          title: 'Buscar',
          headerTitle: 'Buscar Receitas'
        }} 
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen} 
        options={{ 
          title: 'Favoritos',
          headerTitle: 'Receitas Favoritas'
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={SettingsScreen} 
        options={{ 
          title: 'Perfil',
          headerTitle: 'Configurações'
        }}
      />
      </Tab.Navigator>
      {shouldShowFAB && (
        <FloatingActionButton onPress={handleFABPress} />
      )}
    </View>
  );
};

export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: Colors.background,
            },
            headerTintColor: Colors.text,
            headerTitleStyle: {
              fontWeight: '600',
            },
            headerBackTitleVisible: false,
          }}
        >
          <Stack.Screen 
            name="MainTabs" 
            component={TabNavigator} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="RecipeDetail" 
            component={RecipeDetailScreenWrapper}
            options={{ 
              title: 'Receita',
              headerShown: true,
            }}
          />
          <Stack.Screen 
            name="CreateRecipe" 
            component={CreateRecipeScreenWrapper}
            options={{ 
              title: 'Nova Receita',
              headerShown: true,
            }}
          />
          <Stack.Screen 
            name="EditRecipe" 
            component={EditRecipeScreenWrapper}
            options={{ 
              title: 'Editar Receita',
              headerShown: true,
            }}
          />
        </Stack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};
