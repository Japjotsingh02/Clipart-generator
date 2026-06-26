import { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Plus, RotateCcw, X } from 'lucide-react-native';
import { ErrorBanner } from '@/components/ErrorBanner';
import { GenerateButton } from '@/components/GenerateButton';
import { ImageUploader } from '@/components/ImageUploader';
import { StyleCard } from '@/components/StyleCard';
import { colors, CUSTOM_STYLE_ACCENT, radii, spacing } from '@/constants/theme';
import { getAllStyles } from '@/services/aiService';
import { useClipartStore } from '@/store/useClipartStore';

export default function HomeScreen() {
  const {
    selectedImageUri,
    setSelectedImage,
    startGeneratingAll,
    generatedImages,
    isLoading,
    globalError,
    isAnyLoading,
    reset,
    customStyles,
    addCustomStyle,
    removeCustomStyle,
  } = useClipartStore();

  const [customInput, setCustomInput] = useState('');
  const allStyles = getAllStyles(customStyles);
  const hasAnyResult = allStyles.some((style) => generatedImages[style]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
      base64: true,
    });

    if (!result.canceled && result.assets[0].uri && result.assets[0].base64) {
      setSelectedImage(result.assets[0].uri, result.assets[0].base64);
    }
  };

  const handleAddCustomStyle = useCallback(() => {
    const name = customInput.trim();
    if (!name) return;
    addCustomStyle(name);
    setCustomInput('');
  }, [addCustomStyle, customInput]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <Text style={styles.header}>Clipartify ✨</Text>
          {(selectedImageUri || hasAnyResult) && (
            <TouchableOpacity
              onPress={reset}
              style={styles.resetBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <RotateCcw color={colors.textMuted} size={20} />
            </TouchableOpacity>
          )}
        </View>

        <ImageUploader uri={selectedImageUri} disabled={isAnyLoading} onPress={pickImage} />

        {globalError ? <ErrorBanner message={globalError} /> : null}

        {selectedImageUri ? (
          <GenerateButton isLoading={isAnyLoading} onPress={startGeneratingAll} />
        ) : null}

        <View style={styles.grid}>
          {allStyles.map((style) => (
            <View key={style} style={styles.gridItem}>
              <StyleCard
                styleName={style}
                imageUri={generatedImages[style]}
                isLoading={isLoading[style]}
              />
            </View>
          ))}
        </View>

        <View style={styles.customSection}>
          <Text style={styles.customTitle}>+ Add Custom Style</Text>
          <View style={styles.customRow}>
            <TextInput
              style={styles.customInput}
              placeholder="e.g. Watercolor, Cyberpunk…"
              placeholderTextColor={colors.textDim}
              value={customInput}
              onChangeText={setCustomInput}
              onSubmitEditing={handleAddCustomStyle}
              returnKeyType="done"
              autoCapitalize="words"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.addBtn, !customInput.trim() && styles.addBtnDisabled]}
              onPress={handleAddCustomStyle}
              disabled={!customInput.trim()}
            >
              <Plus color={colors.text} size={18} />
            </TouchableOpacity>
          </View>

          {customStyles.length > 0 ? (
            <View style={styles.chipRow}>
              {customStyles.map((style) => (
                <View key={style} style={styles.chip}>
                  <Text style={styles.chipText}>{style}</Text>
                  <TouchableOpacity
                    onPress={() => removeCustomStyle(style)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <X color={CUSTOM_STYLE_ACCENT} size={13} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: 60, paddingTop: spacing.lg },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg + 4,
    position: 'relative',
  },
  header: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  resetBtn: { position: 'absolute', right: 0 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  gridItem: { width: '50%' },
  customSection: {
    marginTop: spacing.lg + 4,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: spacing.lg,
  },
  customTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.md - 2,
    textTransform: 'uppercase',
  },
  customRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  customInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
  },
  addBtn: {
    backgroundColor: colors.customAccent,
    borderRadius: radii.md,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnDisabled: { backgroundColor: colors.customAccentFaded },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md - 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.customAccentBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${colors.customAccent}20`,
    paddingHorizontal: spacing.md - 2,
    paddingVertical: 6,
  },
  chipText: { color: colors.customAccent, fontSize: 13, fontWeight: '600' },
});
