import { create } from 'zustand';
import { generateClipart, getAllStyles } from '@/services/aiService';

interface ClipartState {
  selectedImageUri: string | null;
  selectedImageB64: string | null;
  customStyles: string[];
  generatedImages: Record<string, string>;
  isLoading: Record<string, boolean>;
  globalError: string | null;
  isAnyLoading: boolean;

  setSelectedImage: (uri: string, b64: string) => void;
  addCustomStyle: (name: string) => void;
  removeCustomStyle: (name: string) => void;
  startGeneratingAll: () => Promise<void>;
  reset: () => void;
}

function normalizeCustomStyleName(name: string): string {
  const normalized = name.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
  return normalized.length > 32 ? normalized.slice(0, 32).trim() : normalized;
}

export const useClipartStore = create<ClipartState>((set, get) => ({
  selectedImageUri: null,
  selectedImageB64: null,
  customStyles: [],
  generatedImages: {},
  isLoading: {},
  globalError: null,
  isAnyLoading: false,

  setSelectedImage: (uri, b64) => {
    set({
      selectedImageUri: uri,
      selectedImageB64: b64,
      generatedImages: {},
      isLoading: {},
      globalError: null,
    });
  },

  addCustomStyle: (name) => {
    const cleaned = normalizeCustomStyleName(name);
    if (!cleaned) return;

    const { customStyles } = get();
    const canonical = cleaned.toLowerCase();
    if (getAllStyles(customStyles).some((style) => style.toLowerCase() === canonical)) return;

    set({ customStyles: [...customStyles, cleaned] });
  },

  removeCustomStyle: (name) => {
    set((state) => ({
      customStyles: state.customStyles.filter((style) => style !== name),
      generatedImages: Object.fromEntries(
        Object.entries(state.generatedImages).filter(([key]) => key !== name),
      ),
      isLoading: Object.fromEntries(
        Object.entries(state.isLoading).filter(([key]) => key !== name),
      ),
    }));
  },

  startGeneratingAll: async () => {
    const { selectedImageB64, customStyles } = get();
    if (!selectedImageB64) {
      set({ globalError: 'No image selected.' });
      return;
    }

    const styles = getAllStyles(customStyles);
    set({
      isLoading: Object.fromEntries(styles.map((style) => [style, true])),
      globalError: null,
      generatedImages: {},
      isAnyLoading: true,
    });

    await Promise.allSettled(
      styles.map(async (style) => {
        try {
          const uri = await generateClipart(selectedImageB64, style);
          set((state) => ({
            generatedImages: { ...state.generatedImages, [style]: uri },
            isLoading: { ...state.isLoading, [style]: false },
          }));
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Unknown';
          set((state) => ({
            isLoading: { ...state.isLoading, [style]: false },
            globalError: state.globalError ?? `Error: ${message}`,
          }));
        }
      }),
    );

    set({ isAnyLoading: false });
  },

  reset: () =>
    set({
      selectedImageUri: null,
      selectedImageB64: null,
      customStyles: [],
      generatedImages: {},
      isLoading: {},
      globalError: null,
      isAnyLoading: false,
    }),
}));
