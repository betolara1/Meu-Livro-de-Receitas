import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../constants/theme';
import { useLanguage } from '../contexts/LanguageContext';

interface ImagePickerProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
}

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - 60) / 3; // 3 imagens por linha com espaçamento

export const ImagePickerComponent: React.FC<ImagePickerProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  label,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();
  
  const defaultLabel = label || t('createRecipe.imagePicker.label');

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('createRecipe.imagePicker.permissionNeeded'),
        t('createRecipe.imagePicker.galleryPermission'),
        [{ text: t('common.ok') }]
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
          // Redimensionar para largura máxima de 800px mantendo proporção
          { resize: { width: 800 } },
        ],
        {
          compress: 0.7, // 70% de qualidade
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return manipResult.uri;
    } catch (error) {
      console.error('Erro ao comprimir imagem:', error);
      return uri; // Retorna a imagem original se houver erro
    }
  };

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('createRecipe.imagePicker.permissionNeeded'),
        t('createRecipe.imagePicker.cameraPermission'),
        [{ text: t('common.ok') }]
      );
      return false;
    }
    return true;
  };

  const showImagePickerOptions = () => {
    if (images.length >= maxImages) {
      Alert.alert(
        t('createRecipe.imagePicker.limitReached'),
        t('createRecipe.imagePicker.limitReachedDesc').replace('{max}', maxImages.toString()),
        [{ text: t('common.ok') }]
      );
      return;
    }

    Alert.alert(
      t('createRecipe.imagePicker.selectImage'),
      t('createRecipe.imagePicker.selectImageDesc'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('createRecipe.imagePicker.gallery'), onPress: pickFromGallery },
        { text: t('createRecipe.imagePicker.camera'), onPress: takePhoto },
      ]
    );
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsLoading(true);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        
        // Comprimir a imagem
        const compressedUri = await compressImage(selectedImage.uri);
        
        // Adicionar à lista de imagens
        const newImages = [...images, compressedUri];
        onImagesChange(newImages);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert(t('common.error'), t('createRecipe.imagePicker.errorSelect'));
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
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
        
        // Adicionar à lista de imagens
        const newImages = [...images, compressedUri];
        onImagesChange(newImages);
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert(t('common.error'), t('createRecipe.imagePicker.errorPhoto'));
    } finally {
      setIsLoading(false);
    }
  };


  const removeImage = (index: number) => {
    Alert.alert(
      t('createRecipe.imagePicker.removeImage'),
      t('createRecipe.imagePicker.removeImageDesc'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('createRecipe.imagePicker.remove'),
          style: 'destructive',
          onPress: () => {
            const newImages = images.filter((_, i) => i !== index);
            onImagesChange(newImages);
          },
        },
      ]
    );
  };

  const renderImage = (uri: string, index: number) => (
    <View key={index} style={styles.imageContainer}>
      <Image source={{ uri }} style={styles.image} />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeImage(index)}
      >
        <Ionicons name="close-circle" size={20} color={Colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{defaultLabel}</Text>
      <Text style={styles.subtitle}>
        {images.length}/{maxImages} {t('createRecipe.imagePicker.selected')}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.imagesContainer}
      >
        {images.map((uri, index) => renderImage(uri, index))}
        
        {images.length < maxImages && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={showImagePickerOptions}
            disabled={isLoading}
          >
            <Ionicons
              name={isLoading ? 'hourglass' : 'add'}
              size={24}
              color={Colors.primary}
            />
            <Text style={styles.addButtonText}>
              {isLoading ? t('createRecipe.imagePicker.processing') : t('createRecipe.imagePicker.add')}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {images.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="image-outline" size={48} color={Colors.textSecondary} />
          <Text style={styles.emptyText}>
            {t('createRecipe.imagePicker.emptyText')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  imagesContainer: {
    flexDirection: 'row',
  },
  imageContainer: {
    position: 'relative',
    marginRight: Spacing.sm,
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
    backgroundColor: Colors.gray100,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 2,
  },
  addButton: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
  },
  addButtonText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.primary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
