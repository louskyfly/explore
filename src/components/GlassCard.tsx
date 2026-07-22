import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
  variant?: 'default' | 'elevated' | 'subtle' | 'frosted';
}

export function GlassCard({ onPress, children, style, disabled, variant = 'default' }: Props) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.1 + glow.value * 0.25,
    shadowRadius: 12 + glow.value * 10,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.975, { damping: 12, stiffness: 400 });
    glow.value = withSpring(1, { damping: 12, stiffness: 400 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 400 });
    glow.value = withSpring(0, { damping: 12, stiffness: 400 });
  };

  return (
    <Animated.View style={[animatedStyle, glowStyle, {
      shadowColor: isDark ? '#000' : theme.accent,
      shadowOffset: { width: 0, height: variant === 'elevated' ? 6 : 3 },
      elevation: variant === 'elevated' ? 14 : 7,
    }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: variant === 'subtle'
              ? (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.18)')
              : variant === 'frosted'
              ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.22)')
              : (isDark ? 'rgba(30,30,32,0.42)' : 'rgba(255,255,255,0.32)'),
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)',
            borderWidth: 1,
            opacity: pressed ? 0.85 : 1,
          },
          variant === 'elevated' && styles.elevated,
          style,
        ]}
      >
        {/* Prismatic top edge — simulates light refraction */}
        <LinearGradient
          colors={isDark
            ? ['rgba(140,170,255,0.18)', 'rgba(200,180,255,0.1)', 'rgba(180,255,220,0.08)', 'transparent']
            : ['rgba(180,210,255,0.35)', 'rgba(220,200,255,0.2)', 'rgba(200,255,230,0.18)', 'transparent']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.prismEdge}
        />

        {/* Glass body sheen — top-left to center gradient */}
        <LinearGradient
          colors={isDark
            ? ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.03)', 'transparent']
            : ['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0.7, y: 1 }}
          style={styles.bodySheen}
        />

        {/* Specular highlight — bright spot top-left */}
        <View style={styles.specularContainer}>
          <LinearGradient
            colors={isDark
              ? ['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.05)', 'transparent']
              : ['rgba(255,255,255,1)', 'rgba(255,255,255,0.6)', 'transparent']
            }
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.specularSpot}
          />
        </View>

        {/* Bottom edge shadow — depth illusion */}
        <LinearGradient
          colors={isDark
            ? ['transparent', 'rgba(0,0,0,0.15)']
            : ['transparent', 'rgba(0,0,0,0.04)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.bottomShadow}
        />

        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  prismEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 10,
  },
  bodySheen: {
    ...StyleSheet.absoluteFill,
    borderRadius: 24,
    pointerEvents: 'none',
  },
  specularContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '55%',
    height: '40%',
    overflow: 'hidden',
    borderTopLeftRadius: 24,
    pointerEvents: 'none',
  },
  specularSpot: {
    width: '100%',
    height: '100%',
  },
  bottomShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '35%',
    borderRadius: 24,
    pointerEvents: 'none',
  },
  elevated: {
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 28,
  },
});
