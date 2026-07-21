import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import { Profile, getProfileInfo } from '../types/activity';

export function PinEntryScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { login } = useProfile();
  const profile: Profile = route.params?.profile;

  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [locked, setLocked] = useState(false);
  const info = getProfileInfo(profile);

  const handleDigit = (digit: string) => {
    if (locked) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError(false);

    if (newPin.length === 4) {
      const success = login(profile, newPin);
      if (success) {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      } else {
        Vibration.vibrate(400);
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 600);
      }
    }
  };

  const handleDelete = () => {
    if (locked) return;
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={info?.color || theme.accent} />
        </Pressable>
        <View style={{ flex: 1 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.avatarCircle, { backgroundColor: (info?.color || theme.accent) + '20' }]}>
          <MaterialIcons name="person" size={48} color={info?.color || theme.accent} />
        </View>

        <Text style={[styles.greeting, { color: theme.text }]}>{info?.label || profile}</Text>
        <Text style={[styles.pinLabel, { color: theme.textSecondary }]}>Entrez votre code PIN</Text>

        <Animated.View entering={error ? FadeIn.duration(200) : FadeIn}>
          <View style={styles.dots}>
            {[0, 1, 2, 3].map(i => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i < pin.length
                      ? (error ? '#EF5350' : info?.color || theme.accent)
                      : theme.glassBg,
                    borderColor: i < pin.length
                      ? (error ? '#EF5350' : info?.color || theme.accent)
                      : theme.glassBorder,
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {error && (
          <Animated.View entering={FadeIn}>
            <Text style={[styles.errorText, { color: '#EF5350' }]}>Code incorrect</Text>
          </Animated.View>
        )}

        <View style={styles.keypad}>
          {digits.map((d, i) => {
            if (d === '') return <View key={i} style={styles.keyEmpty} />;
            if (d === 'del') {
              return (
                <Pressable key={i} style={styles.key} onPress={handleDelete}>
                  <MaterialIcons name="backspace" size={26} color={theme.textSecondary} />
                </Pressable>
              );
            }
            return (
              <Pressable
                key={i}
                style={({ pressed }) => [styles.key, {
                  backgroundColor: theme.glassBg,
                  borderColor: theme.glassBorder,
                  borderWidth: 1,
                  transform: [{ scale: pressed ? 0.9 : 1 }],
                  opacity: pressed ? 0.7 : 1,
                }]}
                onPress={() => handleDigit(d)}
              >
                <Text style={[styles.keyText, { color: theme.text }]}>{d}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: { fontSize: 26, fontWeight: '800', marginBottom: 4 },
  pinLabel: { fontSize: 15, marginBottom: 32 },
  dots: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  errorText: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 32,
    width: 280,
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyEmpty: { width: 72, height: 72 },
  keyText: { fontSize: 26, fontWeight: '600' },
});
