import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { PROFILES, Profile } from '../types/activity';

export function ProfileSelectScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const handleSelect = (profile: Profile) => {
    navigation.navigate('PinEntry', { profile });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <MaterialIcons name="explore" size={64} color={theme.accent} style={styles.logo} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={[styles.title, { color: theme.text }]}>Explore</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Qui utilise l'app ?</Text>
        </Animated.View>

        <View style={styles.profiles}>
          {PROFILES.map((p, i) => (
            <Animated.View key={p.key} entering={FadeInDown.delay(300 + i * 150).springify()}>
              <Pressable
                onPress={() => handleSelect(p.key)}
                style={({ pressed }) => [styles.profileCard, {
                  backgroundColor: theme.glassBg,
                  borderColor: theme.glassBorder,
                  borderWidth: 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                }]}
              >
                <LinearGradient
                  colors={[p.color + '30', p.color + '10']}
                  style={styles.profileGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={[styles.iconCircle, { backgroundColor: p.color + '20' }]}>
                    <MaterialIcons name="person" size={40} color={p.color} />
                  </View>
                  <Text style={[styles.profileName, { color: theme.text }]}>{p.label}</Text>
                  <View style={[styles.enterRow, { backgroundColor: p.color + '15' }]}>
                    <Text style={[styles.enterText, { color: p.color }]}>Entrer</Text>
                    <MaterialIcons name="arrow-forward" size={16} color={p.color} />
                  </View>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  logo: { marginBottom: 16 },
  title: { fontSize: 36, fontWeight: '800', textAlign: 'center', letterSpacing: -1 },
  subtitle: { fontSize: 17, textAlign: 'center', marginTop: 8 },
  profiles: { flexDirection: 'row', gap: 16, marginTop: 48 },
  profileCard: {
    width: 150,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  profileGradient: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  enterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  enterText: { fontSize: 14, fontWeight: '600' },
});
