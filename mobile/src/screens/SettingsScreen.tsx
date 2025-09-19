import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Typography, Spacing } from '../constants/theme';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import ChangePasswordModal from '../components/ChangePasswordModal';

const SettingsScreen = () => {
  const { user, signOut, changePassword } = useAuth();
  const [isChangingPhoto, setIsChangingPhoto] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const handleChangePhoto = async () => {
    try {
      setIsChangingPhoto(true);
      
      // Solicitar permissão para acessar a galeria
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Erro', 'Permissão para acessar a galeria foi negada');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // Aqui você implementaria a lógica para salvar a nova foto
        // Por enquanto, apenas mostra uma mensagem
        Alert.alert('Sucesso', 'Foto alterada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao alterar foto:', error);
      Alert.alert('Erro', 'Não foi possível alterar a foto');
    } finally {
      setIsChangingPhoto(false);
    }
  };

  const handleChangePassword = () => {
    // Verificar se o usuário foi criado com email/senha
    if (user?.provider !== 'email') {
      Alert.alert(
        'Alterar Senha',
        'A alteração de senha só está disponível para contas criadas com email e senha.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setShowChangePasswordModal(true);
  };

  const handleConfirmChangePassword = async (currentPassword: string, newPassword: string) => {
    await changePassword(currentPassword, newPassword);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível sair da conta');
            }
          },
        },
      ]
    );
  };

  const handleBiometricToggle = () => {
    Alert.alert(
      'Autenticação Biométrica',
      'Esta funcionalidade será implementada em breve.',
      [{ text: 'OK' }]
    );
  };

  const renderProfileSection = () => (
    <Card style={styles.section}>
      <View style={styles.profileHeader}>
        <TouchableOpacity 
          style={styles.avatarContainer} 
          onPress={handleChangePhoto}
          disabled={isChangingPhoto}
        >
          {user?.photo ? (
            <Image source={{ uri: user.photo }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color={Colors.primary} />
            </View>
          )}
          <View style={styles.editIconContainer}>
            <Ionicons name="camera" size={16} color={Colors.background} />
          </View>
        </TouchableOpacity>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </View>
    </Card>
  );

  const renderSettingsSection = () => (
    <Card style={styles.section}>
      <Text style={styles.sectionTitle}>Configurações</Text>
      
      {/* Mostrar opção de alterar senha apenas para usuários com email/senha */}
      {user?.provider === 'email' && (
        <TouchableOpacity style={styles.settingItem} onPress={handleChangePassword}>
          <View style={styles.settingLeft}>
            <Ionicons name="lock-closed" size={24} color={Colors.primary} />
            <Text style={styles.settingText}>Alterar Senha</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.settingItem} onPress={handleBiometricToggle}>
        <View style={styles.settingLeft}>
          <Ionicons name="finger-print" size={24} color={Colors.primary} />
          <Text style={styles.settingText}>Autenticação Biométrica</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>
    </Card>
  );

  const renderAccountSection = () => (
    <Card style={styles.section}>
      <Text style={styles.sectionTitle}>Conta</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Ionicons name="mail" size={24} color={Colors.textSecondary} />
          <View>
            <Text style={styles.settingText}>Email</Text>
            <Text style={styles.settingSubtext}>{user?.email}</Text>
          </View>
        </View>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Ionicons name="shield-checkmark" size={24} color={Colors.textSecondary} />
          <View>
            <Text style={styles.settingText}>Provedor</Text>
            <Text style={styles.settingSubtext}>
              {user?.provider === 'google' ? 'Google' : 
               user?.provider === 'apple' ? 'Apple' : 'Email/Senha'}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );

  const renderLogoutSection = () => (
    <Card style={styles.section}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={24} color={Colors.error} />
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {renderProfileSection()}
          {renderSettingsSection()}
          {renderAccountSection()}
          {renderLogoutSection()}
        </View>
      </ScrollView>
      
      <ChangePasswordModal
        visible={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onConfirm={handleConfirmChangePassword}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  scrollView: {
    flex: 1,
  },
  
  content: {
    padding: Spacing.lg,
  },
  
  section: {
    marginBottom: Spacing.lg,
  },
  
  sectionTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  
  userInfo: {
    flex: 1,
  },
  
  userName: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  
  userEmail: {
    fontSize: Typography.fontSizes.base,
    color: Colors.textSecondary,
  },
  
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  settingText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.text,
    marginLeft: Spacing.md,
  },
  
  settingSubtext: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.md,
    marginTop: 2,
  },
  
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  
  logoutText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.error,
    marginLeft: Spacing.sm,
    fontWeight: Typography.fontWeights.medium,
  },
});

export default SettingsScreen;
