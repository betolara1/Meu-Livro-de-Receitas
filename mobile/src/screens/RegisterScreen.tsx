import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Colors } from '../constants/theme';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { useKeyboard } from '../hooks/useKeyboard';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { signUp, signInWithGoogle, signInWithApple, isLoading } = useAuth();
  const { t } = useLanguage();
  const { keyboardVisible, dismissKeyboard } = useKeyboard();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), 'Por favor, informe seu nome');
      return false;
    }

    if (!email.trim()) {
      Alert.alert(t('common.error'), 'Por favor, informe seu email');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert(t('common.error'), 'Por favor, informe um email válido');
      return false;
    }

    if (!password.trim()) {
      Alert.alert(t('common.error'), 'Por favor, informe uma senha');
      return false;
    }

    if (password.length < 6) {
      Alert.alert(t('common.error'), 'A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('common.error'), 'As senhas não coincidem');
      return false;
    }

    return true;
  };

  const handleEmailRegister = async () => {
    dismissKeyboard();
    
    if (!validateForm()) return;

    try {
      await signUp(email.trim(), password, name.trim());
    } catch (error) {
      Alert.alert(t('common.error'), error instanceof Error ? error.message : 'Erro ao criar conta');
    }
  };

  const handleGoogleLogin = async () => {
    dismissKeyboard();
    
    try {
      await signInWithGoogle();
    } catch (error) {
      Alert.alert(t('common.error'), 'Erro ao fazer login com Google');
    }
  };

  const handleAppleLogin = async () => {
    dismissKeyboard();
    
    try {
      await signInWithApple();
    } catch (error) {
      Alert.alert(t('common.error'), 'Erro ao fazer login com Apple');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="restaurant" size={60} color={Colors.primary} />
            </View>
            <Text style={styles.title}>{t('register.title')}</Text>
            <Text style={styles.subtitle}>{t('register.subtitle')}</Text>
          </View>

          <View style={styles.form}>
            <Input
              label={t('register.fullName')}
              value={name}
              onChangeText={setName}
              placeholder="Seu nome completo"
              autoCapitalize="words"
              leftIcon="person-outline"
            />

            <Input
              label={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="mail-outline"
            />

            <Input
              label={t('auth.password')}
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 6 caracteres"
              secureTextEntry={!showPassword}
              leftIcon="lock-closed-outline"
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <Input
              label={t('auth.confirmPassword')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirme sua senha"
              secureTextEntry={!showConfirmPassword}
              leftIcon="lock-closed-outline"
              rightIcon={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            <Button
              title={t('register.createAccount')}
              onPress={handleEmailRegister}
              loading={isLoading}
              style={styles.registerButton}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              title={t('register.loginWithGoogle')}
              onPress={handleGoogleLogin}
              loading={isLoading}
              variant="outline"
              leftIcon="logo-google"
              style={styles.socialButton}
            />

            {Platform.OS === 'ios' && (
              <Button
                title={t('register.loginWithApple')}
                onPress={handleAppleLogin}
                loading={isLoading}
                variant="outline"
                leftIcon="logo-apple"
                style={styles.socialButton}
              />
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('register.alreadyHaveAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>{t('register.login')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  registerButton: {
    marginBottom: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  socialButton: {
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  footerLink: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
