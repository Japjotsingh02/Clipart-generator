import { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Download, Share2 } from 'lucide-react-native';
import { colors, CUSTOM_STYLE_ACCENT, radii, spacing, STYLE_COLORS } from '@/constants/theme';

interface StyleCardProps {
  styleName: string;
  imageUri?: string;
  isLoading?: boolean;
}

export function StyleCard({ styleName, imageUri, isLoading }: StyleCardProps) {
  const accent = STYLE_COLORS[styleName as keyof typeof STYLE_COLORS] ?? CUSTOM_STYLE_ACCENT;

  const getLocalFile = useCallback(async () => {
    const filename = `${FileSystem.cacheDirectory}${styleName.replace(/\s+/g, '_')}_clipart.jpg`;
    await FileSystem.downloadAsync(imageUri!, filename);
    return filename;
  }, [imageUri, styleName]);

  const handleSave = useCallback(async () => {
    if (!imageUri) return;
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Allow media access to save images.');
        return;
      }
      const filename = await getLocalFile();
      await MediaLibrary.saveToLibraryAsync(filename);
      Alert.alert('Saved!', `${styleName} clipart saved to your gallery.`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to save image.';
      Alert.alert('Error', message);
    }
  }, [getLocalFile, imageUri, styleName]);

  const handleShare = useCallback(async () => {
    if (!imageUri) return;
    try {
      const filename = await getLocalFile();
      await Sharing.shareAsync(filename, { mimeType: 'image/jpeg' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to share image.';
      Alert.alert('Error', message);
    }
  }, [getLocalFile, imageUri]);

  return (
    <View style={[styles.card, { borderColor: imageUri ? accent : colors.borderMuted }]}>
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: accent }]} />
        <Text style={styles.title}>{styleName}</Text>
      </View>

      <View style={styles.imageContainer}>
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={accent} />
            <Text style={[styles.loadingText, { color: accent }]}>Generating…</Text>
          </View>
        ) : imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={styles.placeholder}>Ready</Text>
        )}
      </View>

      {imageUri ? (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: `${accent}22` }]}
            onPress={handleSave}
          >
            <Download color={accent} size={16} />
            <Text style={[styles.actionText, { color: accent }]}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: `${accent}22` }]}
            onPress={handleShare}
          >
            <Share2 color={accent} size={16} />
            <Text style={[styles.actionText, { color: accent }]}>Share</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm + 2,
    paddingBottom: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  title: { color: colors.text, fontSize: 13, fontWeight: '700', letterSpacing: 0.4 },
  imageContainer: {
    height: 150,
    backgroundColor: colors.surfaceDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: { alignItems: 'center', gap: spacing.sm },
  loadingText: { fontSize: 11, fontWeight: '600' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: { color: colors.textPlaceholder, fontSize: 12 },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  actionText: { fontSize: 12, fontWeight: '600' },
});
