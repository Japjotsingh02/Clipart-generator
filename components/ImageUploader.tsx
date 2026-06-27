import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Upload } from 'lucide-react-native';
import { colors, radii, spacing } from '@/constants/theme';

interface ImageUploaderProps {
  uri: string | null;
  disabled?: boolean;
  onPress: () => void;
}

export function ImageUploader({ uri, disabled, onPress }: ImageUploaderProps) {
  return (
    <TouchableOpacity
      style={[styles.container, uri ? styles.filled : styles.empty]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled}
      accessibilityRole="imagebutton"
      accessibilityLabel={uri ? 'Change source image' : 'Select source image'}
    >
      {uri ? (
        <>
          <Image source={{ uri }} style={styles.image} resizeMode="cover" />
          <View style={styles.overlay}>
            <Upload color={colors.text} size={20} />
            <Text style={styles.overlayText}>Change</Text>
          </View>
        </>
      ) : (
        <View style={styles.placeholder}>
          <Upload color={colors.textDim} size={44} />
          <Text style={styles.placeholderTitle}>Tap to select your photo</Text>
          <Text style={styles.placeholderSub}>JPG · PNG supported</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 260,
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  filled: {
    borderWidth: 0,
  },
  image: StyleSheet.absoluteFillObject,
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  overlayText: { color: colors.text, fontWeight: '600', fontSize: 14 },
  placeholder: { alignItems: 'center', gap: spacing.sm },
  placeholderTitle: { color: colors.textMuted, fontSize: 16, fontWeight: '500' },
  placeholderSub: { color: colors.textDim, fontSize: 12 },
});
