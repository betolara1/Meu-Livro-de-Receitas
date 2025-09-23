import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../constants/theme';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from './ui/Card';
import { GeminiService, GeminiRecipeData } from '../services/geminiService';

interface AIPhotoSectionProps {
  aiPhoto: string | null;
  onPhotoChange: (photo: string | null) => void;
  onRecipeDataExtracted: (data: GeminiRecipeData) => void;
  t: (key: string, options?: any) => string;
}

export const AIPhotoSection: React.FC<AIPhotoSectionProps> = ({
  aiPhoto,
  onPhotoChange,
  onRecipeDataExtracted,
  t,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('common.permissionRequired'), t('common.cameraPermissionDenied'), [{ text: t('common.ok') }]);
      return false;
    }
    return true;
  };

  const compressImage = async (uri: string): Promise<string> => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width: 800 } },
        ],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return manipResult.uri;
    } catch (error) {
      console.error('Erro ao comprimir imagem:', error);
      return uri;
    }
  };

  const takePhotoForAI = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    setIsLoading(true);

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        
        // Comprimir a imagem
        const compressedUri = await compressImage(selectedImage.uri);
        
        // Salvar a foto para IA
        onPhotoChange(compressedUri);

        // Analisar com IA
        setIsAnalyzing(true);
        try {
          const recipeData = await GeminiService.analyzeRecipeImage(compressedUri);
          onRecipeDataExtracted(recipeData);
          
          Alert.alert(t('aiPhoto.analysisComplete'), t('aiPhoto.analysisSuccessMessage'), [{ text: t('common.ok') }]);
        } catch (error) {
          console.error('Erro ao analisar imagem com IA:', error);
          Alert.alert(t('aiPhoto.analysisError'), t('aiPhoto.analysisErrorMessage'), [{ text: t('common.ok') }]);
        } finally {
          setIsAnalyzing(false);
        }
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert(t('common.error'), t('aiPhoto.takePhotoError'));
    } finally {
      setIsLoading(false);
    }
  };

  const removePhoto = () => {
    Alert.alert(t('aiPhoto.removePhoto'), t('aiPhoto.removePhotoConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.remove'), style: 'destructive', onPress: () => onPhotoChange(null) },
    ]);
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="camera" size={20} color={Colors.primary} />
          <Text style={styles.title}>{t('aiPhoto.title')}</Text>
        </View>
        <Text style={styles.subtitle}>
          {t('aiPhoto.subtitle')}
        </Text>
      </View>

      {aiPhoto ? (
        <View style={styles.photoContainer}>
          <Image source={{ uri: aiPhoto }} style={styles.photo} />
          <View style={styles.photoActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={takePhotoForAI}
              disabled={isLoading || isAnalyzing}
            >
              <Ionicons name="camera" size={16} color={Colors.primary} />
              <Text style={styles.actionButtonText}>
                {isLoading ? t('common.processing') : isAnalyzing ? t('common.analyzing') : t('aiPhoto.newPhoto')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.removeButton]}
              onPress={removePhoto}
              disabled={isLoading || isAnalyzing}
            >
              <Ionicons name="trash" size={16} color={Colors.error} />
              <Text style={[styles.actionButtonText, styles.removeButtonText]}>{t('common.remove')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.photoPlaceholder}
          onPress={takePhotoForAI}
          disabled={isLoading || isAnalyzing}
        >
          {isLoading || isAnalyzing ? (
            <ActivityIndicator size="large" color={Colors.primary} />
          ) : (
            <Ionicons name="camera" size={48} color={Colors.primary} />
          )}
          <Text style={styles.placeholderText}>
            {isLoading ? t('common.processing') : isAnalyzing ? t('aiPhoto.analyzingWithAI') : t('aiPhoto.tapToTakePhoto')}
          </Text>
          <Text style={styles.placeholderSubtext}>{t('aiPhoto.aiExtractsInfo')}</Text>
        </TouchableOpacity>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  
  header: {
    marginBottom: Spacing.md,
  },
  
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  
  title: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  
  subtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  
  photoContainer: {
    alignItems: 'center',
  },
  
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.gray100,
    marginBottom: Spacing.md,
  },
  
  photoActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  
  removeButton: {
    backgroundColor: Colors.error + '20',
    borderColor: Colors.error,
  },
  
  actionButtonText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.primary,
    marginLeft: Spacing.xs,
  },
  
  removeButtonText: {
    color: Colors.error,
  },
  
  photoPlaceholder: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    backgroundColor: Colors.primaryLight,
  },
  
  placeholderText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.primary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  
  placeholderSubtext: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
});
