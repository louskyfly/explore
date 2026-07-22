import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Dimensions, KeyboardAvoidingView, Platform, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function GlassModal({ visible, onClose, children }: Props) {
  const { theme, isDark } = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(visible ? 1 : 0, { damping: 20, stiffness: 200 });
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.5,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * 400 }],
    opacity: progress.value,
  }));

  return (
    <Modal visible={visible} transparent statusBarTranslucent animationType="none">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <Animated.View
          style={[
            styles.content,
            contentStyle,
            {
              backgroundColor: isDark ? 'rgba(20,20,22,0.55)' : 'rgba(255,255,255,0.4)',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)',
              borderWidth: 1,
              shadowColor: isDark ? '#000' : '#007AFF',
            },
          ]}
        >
          {/* Prismatic top edge */}
          <LinearGradient
            colors={isDark
              ? ['rgba(140,170,255,0.15)', 'rgba(200,180,255,0.08)', 'transparent']
              : ['rgba(180,210,255,0.3)', 'rgba(220,200,255,0.15)', 'transparent']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.prismEdge}
          />

          {/* Body sheen */}
          <LinearGradient
            colors={isDark
              ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)', 'transparent']
              : ['rgba(255,255,255,0.65)', 'rgba(255,255,255,0.15)', 'transparent']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.bodySheen}
          />

          {/* Specular highlight */}
          <View style={styles.specularContainer}>
            <LinearGradient
              colors={isDark
                ? ['rgba(255,255,255,0.18)', 'transparent']
                : ['rgba(255,255,255,1)', 'rgba(255,255,255,0.5)', 'transparent']
              }
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.specularSpot}
            />
          </View>

          <Pressable style={styles.handle}>
            <View style={[styles.handleBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }]} />
          </Pressable>
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: '#000' },
  content: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    paddingBottom: 40,
    maxHeight: '90%',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  prismEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    zIndex: 10,
  },
  bodySheen: {
    ...StyleSheet.absoluteFill,
    pointerEvents: 'none',
  },
  specularContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '50%',
    height: '30%',
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  specularSpot: {
    width: '100%',
    height: '100%',
  },
  handle: { alignItems: 'center', paddingVertical: 10 },
  handleBar: { width: 40, height: 5, borderRadius: 2.5 },
});
