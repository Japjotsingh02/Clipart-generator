import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { colors, radii, spacing } from '@/constants/theme';

interface GenerateButtonProps {
  isLoading: boolean;
  onPress: () => void;
}

export function GenerateButton({ isLoading, onPress }: GenerateButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.btn, isLoading && styles.btnDisabled]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isLoading}
      accessibilityRole="button"
      accessibilityLabel={isLoading ? 'Generating cliparts, please wait' : 'Generate Cliparts'}
      accessibilityState={{ busy: isLoading }}
    >
      {isLoading ? (
        <View style={styles.inner}>
          <ActivityIndicator color={colors.text} size="small" />
          <Text style={styles.label}>Generating…</Text>
        </View>
      ) : (
        <View style={styles.inner}>
          <Sparkles color={colors.text} size={20} />
          <Text style={styles.label}>Generate Cliparts</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.accent,
    padding: 17,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
    elevation: 6,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  btnDisabled: { backgroundColor: colors.accentFaded },
  inner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  label: { color: colors.text, fontSize: 17, fontWeight: '700' },
});
