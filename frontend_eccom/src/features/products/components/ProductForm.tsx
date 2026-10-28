
import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { isAxiosError } from 'axios';

import AppButton from '@/components/ui/app-button';
import AppText from '@/components/ui/app-text';
import AppView from '@/components/ui/app-view';
import { Colors, Spacing } from '@/constants/theme';

import {
  getProductFormOptions,
} from '@/features/products/api/product-options-api';
import type {
  ProductFormOptions,
} from '@/features/products/api/product-options-api';
import type {
  CreateProductFormData,
  ProductFile,
} from '@/features/products/types/create-product';

// Must match ALLOWED_FILE_EXTENSIONS in the backend's products/models.py.
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Turns a DRF validation response like {"price": ["..."]} into readable text.
function getSubmitErrorMessage(error: unknown): string {
  const fallback = 'Unable to create the product. Please try again.';

  if (!isAxiosError(error)) {
    return fallback;
  }

  const data: unknown = error.response?.data;

  if (!data || typeof data !== 'object') {
    return error.response ? fallback : 'Cannot reach the server. Check your connection.';
  }

  const messages = Object.entries(data).map(([field, value]) => {
    const text = Array.isArray(value) ? value.join(' ') : String(value);
    return field === 'detail' || field === 'non_field_errors'
      ? text
      : `${field}: ${text}`;
  });

  return messages.length > 0 ? messages.join('\n') : fallback;
}

interface ProductFormProps {
  onSubmit: (values: CreateProductFormData) => Promise<void>;
}

export default function ProductForm({
  onSubmit,
}: ProductFormProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [stock, setStock] = useState('0');

  const [image, setImage] = useState<ProductFile | null>(null);
  const [productFile, setProductFile] = useState<ProductFile | null>(null);

  const [options, setOptions] =
    useState<ProductFormOptions | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const [isPickingImage, setIsPickingImage] = useState(false);
  const [isPickingDocument, setIsPickingDocument] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadOptions = async () => {
      try {
        setOptionsError(null);
        const data = await getProductFormOptions();

        if (isActive) {
          setOptions(data);
        }
      } catch {
        if (isActive) {
          setOptionsError(
            'Unable to load categories and conditions.',
          );
        }
      } finally {
        if (isActive) {
          setIsLoadingOptions(false);
        }
      }
    };

    void loadOptions();

    return () => {
      isActive = false;
    };
  }, []);

  const pickImage = async () => {
    try {
      setIsPickingImage(true);
      setError(null);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];

      setImage({
        uri: asset.uri,
        name: asset.fileName ?? `product-image-${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      });
    } catch {
      setError('Unable to select the image. Please try again.');
    } finally {
      setIsPickingImage(false);
    }
  };

  const pickDocument = async () => {
    try {
      setIsPickingDocument(true);
      setError(null);

      const result = await DocumentPicker.getDocumentAsync({
        type: ALLOWED_DOCUMENT_TYPES,
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];

      setProductFile({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType ?? 'application/octet-stream',
      });
    } catch {
      setError('Unable to select the document. Please try again.');
    } finally {
      setIsPickingDocument(false);
    }
  };

  const handleSubmit = async () => {
    if (
      !name.trim() ||
      !description.trim() ||
      !price.trim()
    ) {
      setError('Please fill in the name, description, and price.');
      return;
    }

    if (!category) {
      setError('Please select a category.');
      return;
    }

    if (!condition) {
      setError('Please select a product condition.');
      return;
    }

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError('Enter a valid price greater than zero.');
      return;
    }

    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      setError('Stock must be a whole number of zero or more.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        price: price.trim(),
        category,
        condition,
        stock: parsedStock,
        image,
        product_file: productFile,
      });
    } catch (submitError) {
      setError(getSubmitErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    color: theme.text,
    backgroundColor: theme.surface,
  };

  const selectedCategory = options?.categories.find(
    (item) => item.value === category,
  );

  return (
    <AppView className="flex-1">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: Spacing.lg,
          gap: Spacing.md,
        }}
      >
        <AppText type="title">Create Product</AppText>

        <View style={{ gap: Spacing.sm }}>
          <AppText>Name *</AppText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter product name"
            placeholderTextColor={theme.textSecondary}
            style={inputStyle}
            maxLength={150}
          />

          <AppText>Description *</AppText>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the product"
            placeholderTextColor={theme.textSecondary}
            style={[inputStyle, { minHeight: 100 }]}
            multiline
            textAlignVertical="top"
          />

          <AppText>Price (₹) *</AppText>
          <TextInput
            value={price}
            onChangeText={setPrice}
            placeholder="Enter price"
            placeholderTextColor={theme.textSecondary}
            keyboardType="decimal-pad"
            style={inputStyle}
          />

          <AppText>Stock *</AppText>
          <TextInput
            value={stock}
            onChangeText={setStock}
            placeholder="Enter stock quantity"
            placeholderTextColor={theme.textSecondary}
            keyboardType="number-pad"
            style={inputStyle}
          />

          <AppText>Category *</AppText>

          {isLoadingOptions ? (
            <AppText color="secondary">
              Loading categories...
            </AppText>
          ) : optionsError ? (
            <View style={{ gap: Spacing.sm }}>
              <AppText color="secondary">{optionsError}</AppText>
              <AppButton
                variant="outline"
                onPress={() => {
                  setIsLoadingOptions(true);
                  setOptionsError(null);

                  void getProductFormOptions()
                    .then(setOptions)
                    .catch(() => {
                      setOptionsError(
                        'Unable to load categories and conditions.',
                      );
                    })
                    .finally(() => setIsLoadingOptions(false));
                }}
              >
                Retry Loading Options
              </AppButton>
            </View>
          ) : (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Choose product category"
                accessibilityState={{ expanded: isCategoryOpen }}
                onPress={() =>
                  setIsCategoryOpen((previous) => !previous)
                }
                style={{
                  ...inputStyle,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <AppText
                  color={selectedCategory ? 'text' : 'secondary'}
                >
                  {selectedCategory?.label ?? 'Select a category'}
                </AppText>
                <AppText color="secondary">
                  {isCategoryOpen ? '▲' : '▼'}
                </AppText>
              </Pressable>

              {isCategoryOpen &&
                options?.categories.map((item) => (
                  <Pressable
                    key={item.value}
                    accessibilityRole="button"
                    onPress={() => {
                      setCategory(item.value);
                      setIsCategoryOpen(false);
                      setError(null);
                    }}
                    style={{
                      padding: Spacing.md,
                      borderRadius: 8,
                      backgroundColor:
                        category === item.value
                          ? theme.backgroundSelected
                          : theme.surface,
                    }}
                  >
                    <AppText>{item.label}</AppText>
                  </Pressable>
                ))}
            </>
          )}

          <AppText>Condition *</AppText>

          {isLoadingOptions ? (
            <AppText color="secondary">
              Loading conditions...
            </AppText>
          ) : options ? (
            options.conditions.map((item) => (
              <Pressable
                key={item.value}
                accessibilityRole="radio"
                accessibilityState={{
                  checked: condition === item.value,
                }}
                onPress={() => {
                  setCondition(item.value);
                  setError(null);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: Spacing.md,
                  paddingVertical: Spacing.sm,
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor:
                      condition === item.value
                        ? theme.primary
                        : theme.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {condition === item.value ? (
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: theme.primary,
                      }}
                    />
                  ) : null}
                </View>
                <AppText>{item.label}</AppText>
              </Pressable>
            ))
          ) : null}

          <AppText>Product Image</AppText>
          <AppText color="secondary" type="small">
            Choose an image from your device. This field is optional
            unless your backend requires it.
          </AppText>

          {image ? (
            <View style={{ gap: Spacing.sm }}>
              <Image
                source={{ uri: image.uri }}
                resizeMode="cover"
                accessibilityLabel="Selected product image preview"
                style={{
                  width: '100%',
                  height: 200,
                  borderRadius: 12,
                }}
              />
              <AppText color="secondary" type="small">
                {image.name}
              </AppText>
              <AppButton
                variant="outline"
                onPress={() => setImage(null)}
              >
                Remove Image
              </AppButton>
            </View>
          ) : null}

          <AppButton
            variant="secondary"
            onPress={() => void pickImage()}
            loading={isPickingImage}
            disabled={isPickingImage || isSubmitting}
          >
            {image ? 'Choose Another Image' : 'Choose Image'}
          </AppButton>

          <AppText>Product Document</AppText>
          <AppText color="secondary" type="small">
            Attach a PDF, DOC, or DOCX file. This field is optional.
          </AppText>

          {productFile ? (
            <View style={{ gap: Spacing.sm }}>
              <AppText>{productFile.name}</AppText>
              <AppButton
                variant="outline"
                onPress={() => setProductFile(null)}
              >
                Remove Document
              </AppButton>
            </View>
          ) : null}

          <AppButton
            variant="secondary"
            onPress={() => void pickDocument()}
            loading={isPickingDocument}
            disabled={isPickingDocument || isSubmitting}
          >
            {productFile ? 'Choose Another Document' : 'Choose Document'}
          </AppButton>

          {error ? (
            <AppText color="secondary">{error}</AppText>
          ) : null}


          
<AppButton
  onPress={() => void handleSubmit()}
  loading={isSubmitting}
  disabled={
    isSubmitting ||
    isLoadingOptions ||
    !!optionsError ||
    isPickingImage ||
    isPickingDocument
  }
  style={{
    marginTop: Spacing.md,
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: theme.primary,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  }}
>
  {isSubmitting ? 'Creating Product...' : '＋  Create Product'}
</AppButton>

        </View>
      </ScrollView>
    </AppView>
  );
}
