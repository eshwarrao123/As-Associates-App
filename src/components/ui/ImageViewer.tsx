import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PinchGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Icon } from './Icon';
import { Colors, FontFamily } from '../../constants/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageViewerProps {
  visible: boolean;
  images: Array<{ id: string; url: string }>;
  initialIndex?: number;
  onClose: () => void;
}

/**
 * Full-screen image viewer with pinch-to-zoom, pan, and swipe navigation.
 * Supports multiple images with left/right swipe.
 */
export function ImageViewer({
  visible,
  images,
  initialIndex = 0,
  onClose,
}: ImageViewerProps): React.ReactElement {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Reset index when modal opens
  React.useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
    }
  }, [visible, initialIndex]);

  // Zoom and pan state
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);

  // Swipe state
  const swipeX = useSharedValue(0);

  const resetZoom = () => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedScale.value = 1;
  };

  const handleNextImage = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetZoom();
    }
  };

  const handlePrevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetZoom();
    }
  };

  // Pinch gesture handler
  const onPinchGesture = (event: any) => {
    'worklet';
    const newScale = savedScale.value * event.nativeEvent.scale;
    scale.value = Math.max(1, Math.min(newScale, 4));
  };

  const onPinchEnd = () => {
    'worklet';
    savedScale.value = scale.value;
    if (scale.value < 1.1) {
      scale.value = withSpring(1);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      savedScale.value = 1;
    }
  };

  // Pan gesture handler
  const onPanGesture = (event: any) => {
    'worklet';
    if (scale.value > 1) {
      // Pan while zoomed
      translateX.value = event.nativeEvent.translationX;
      translateY.value = event.nativeEvent.translationY;
    } else {
      // Horizontal swipe for image navigation
      swipeX.value = event.nativeEvent.translationX;
    }
  };

  const onPanEnd = (event: any) => {
    'worklet';
    if (scale.value > 1) {
      // Constrain pan to image bounds
      const maxTranslateX = (SCREEN_WIDTH * (scale.value - 1)) / 2;
      const maxTranslateY = (SCREEN_HEIGHT * (scale.value - 1)) / 2;

      if (Math.abs(translateX.value) > maxTranslateX) {
        translateX.value = withSpring(
          translateX.value > 0 ? maxTranslateX : -maxTranslateX,
        );
      }
      if (Math.abs(translateY.value) > maxTranslateY) {
        translateY.value = withSpring(
          translateY.value > 0 ? maxTranslateY : -maxTranslateY,
        );
      }
    } else {
      // Swipe detection
      const velocity = event.nativeEvent.velocityX;
      const translation = swipeX.value;

      if (translation > SCREEN_WIDTH / 3 || velocity > 500) {
        runOnJS(handlePrevImage)();
      } else if (translation < -SCREEN_WIDTH / 3 || velocity < -500) {
        runOnJS(handleNextImage)();
      }

      swipeX.value = withSpring(0);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const currentImage = images[currentIndex];

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <GestureHandlerRootView style={styles.container}>
        <StatusBar hidden />
        <View style={styles.background}>
          {/* Close button */}
          <SafeAreaView edges={['top']} style={styles.header}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={12}
              activeOpacity={0.7}
            >
              <Icon name="close" size="lg" color={Colors.surface} />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Image with gesture handlers */}
          <View style={styles.imageContainer}>
            <PinchGestureHandler
              onGestureEvent={onPinchGesture}
              onEnded={onPinchEnd}
            >
              <Animated.View style={styles.gestureView}>
                <PanGestureHandler
                  onGestureEvent={onPanGesture}
                  onEnded={onPanEnd}
                >
                  <Animated.View style={styles.gestureView}>
                    <Animated.Image
                      source={{ uri: currentImage?.url }}
                      style={[styles.image, animatedStyle]}
                      resizeMode="contain"
                    />
                  </Animated.View>
                </PanGestureHandler>
              </Animated.View>
            </PinchGestureHandler>
          </View>

          {/* Image counter */}
          {images.length > 1 && (
            <SafeAreaView edges={['bottom']} style={styles.footer}>
              <View style={styles.counterChip}>
                <Icon name="photo" size="sm" color={Colors.surface} />
                <Text style={styles.counterText}>
                  {currentIndex + 1} / {images.length}
                </Text>
              </View>
            </SafeAreaView>
          )}
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gestureView: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: 'center',
    paddingVertical: 20,
  },
  counterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  counterText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.surface,
  },
});
