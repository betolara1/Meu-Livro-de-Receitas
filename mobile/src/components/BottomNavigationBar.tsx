import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

interface BottomNavigationBarProps {
  currentScreen?: string;
}

export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({ 
  currentScreen = 'Home' 
}) => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const navigateToScreen = (screenName: string) => {
    if (screenName === 'Home') {
      navigation.navigate('MainTabs', { screen: 'Home' });
    } else if (screenName === 'Search') {
      navigation.navigate('MainTabs', { screen: 'Search' });
    } else if (screenName === 'Favorites') {
      navigation.navigate('MainTabs', { screen: 'Favorites' });
    } else if (screenName === 'Profile') {
      navigation.navigate('MainTabs', { screen: 'Profile' });
    }
  };

  const renderTabIcon = (screenName: string, isActive: boolean) => {
    if (screenName === 'Profile') {
      return (
        <View style={[
          styles.profileIcon,
          isActive && styles.activeProfileIcon
        ]}>
          {user?.photo ? (
            <View style={styles.profilePhoto} />
          ) : (
            <Ionicons 
              name="person" 
              size={20} 
              color={isActive ? Colors.background : Colors.primary} 
            />
          )}
        </View>
      );
    }

    let iconName: keyof typeof Ionicons.glyphMap;
    switch (screenName) {
      case 'Home':
        iconName = isActive ? 'home' : 'home-outline';
        break;
      case 'Search':
        iconName = isActive ? 'search' : 'search-outline';
        break;
      case 'Favorites':
        iconName = isActive ? 'heart' : 'heart-outline';
        break;
      default:
        iconName = 'home-outline';
    }

    return (
      <Ionicons 
        name={iconName} 
        size={24} 
        color={isActive ? Colors.primary : Colors.textSecondary} 
      />
    );
  };

  const tabs = [
    { name: 'Home', label: 'Início' },
    { name: 'Search', label: 'Buscar' },
    { name: 'Favorites', label: 'Favoritos' },
    { name: 'Profile', label: 'Perfil' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => navigateToScreen(tab.name)}
            activeOpacity={0.7}
          >
            {renderTabIcon(tab.name, isActive)}
            <Text style={[
              styles.tabLabel,
              isActive && styles.activeTabLabel
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: 8,
    paddingTop: 8,
    height: 60,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  activeTabLabel: {
    color: Colors.primary,
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  activeProfileIcon: {
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  profilePhoto: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
  },
});
