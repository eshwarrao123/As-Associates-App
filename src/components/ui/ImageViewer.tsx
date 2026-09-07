import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from './Icon';
import { Colors } from '../../constants/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImageViewerProps {
  visible: boolean;
  imageUrl: string;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Full-screen image viewer modal
 * - Displays single image at useful size
 * - Shows loading state
 * - Handles broken/invalid images
 * - Close button + Android back gesture
 */
export const ImageViewer: React.FC<ImageViewerProps> = ({ visible, imageUrl, onClose }) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  // Reset loading/error state when image changes
  React.useEffect(() => {
    if (visible) {
      setLoading(true);
      setError(false);
    }
  }, [visible, imageUrl]);

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Close button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.closeButton}
          >
            <Icon name="close" size="lg" color={Colors.textOnPrimary} />
          </TouchableOpacity>
        </View>

        {/* Image container */}
        <View style={styles.imageContainer}>
          {error ? (
            <View style={styles.errorContainer}>
              <Icon name="photo" size="2xl" color={Colors.textMuted} />
            </View>
          ) : (
            <>
              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                </View>
              )}
              <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                resizeMode="contain"
                onLoadEnd={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setError(true);
                }}
              />
            </>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 120,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
