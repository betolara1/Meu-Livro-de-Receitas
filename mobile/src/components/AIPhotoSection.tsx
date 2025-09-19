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
import { Card } from './ui/Card';
import { GeminiService, GeminiRecipeData } from '../services/geminiService';

interface AIPhotoSectionProps {
  aiPhoto: string | null;
  onPhotoChange: (photo: string | null) => void;
  onRecipeDataExtracted: (data: GeminiRecipeData) => void;
}

export const AIPhotoSection: React.FC<AIPhotoSectionProps> = ({
  aiPhoto,
  onPhotoChange,
  onRecipeDataExtracted,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão Necessária',
        'Precisamos de permissão para acessar a câmera para tirar fotos da receita.',
        [{ text: 'OK' }]
      );
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
          
          Alert.alert(
            'Análise Concluída!',
            'A IA analisou sua foto e preencheu automaticamente os campos da receita. Verifique e ajuste conforme necessário.',
            [{ text: 'OK' }]
          );
        } catch (error) {
          console.error('Erro ao analisar imagem com IA:', error);
          Alert.alert(
            'Erro na Análise',
            'Não foi possível analisar a imagem com IA. Você pode preencher os dados manualmente.',
            [{ text: 'OK' }]
          );
        } finally {
          setIsAnalyzing(false);
        }
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const removePhoto = () => {
    Alert.alert(
      'Remover Foto',
      'Tem certeza que deseja remover esta foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => onPhotoChange(null),
        },
      ]
    );
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="camera" size={20} color={Colors.primary} />
          <Text style={styles.title}>Foto para IA</Text>
        </View>
        <Text style={styles.subtitle}>
          Tire uma foto da sua receita para a IA extrair as informações automaticamente
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
                {isLoading ? 'Processando...' : isAnalyzing ? 'Analisando...' : 'Nova Foto'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.removeButton]}
              onPress={removePhoto}
              disabled={isLoading || isAnalyzing}
            >
              <Ionicons name="trash" size={16} color={Colors.error} />
              <Text style={[styles.actionButtonText, styles.removeButtonText]}>Remover</Text>
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
            {isLoading ? 'Processando...' : isAnalyzing ? 'Analisando com IA...' : 'Toque para tirar foto'}
          </Text>
          <Text style={styles.placeholderSubtext}>
            A IA irá extrair automaticamente as informações da receita
          </Text>
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
    backgroundColor: Colors.errorLight,
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
