import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../contexts/ThemeContext';
import { useActivities } from '../contexts/ActivityContext';
import { useSync } from '../contexts/SyncContext';

const COLORS = [
  '#007AFF', '#5856D6', '#FF2D55', '#FF9500', '#34C759',
  '#FF3B30', '#AF52DE', '#00C7BE', '#FF6482', '#30B0C7',
];

export function SettingsScreen() {
  const { theme, isDark, settings, updateSettings } = useTheme();
  const { activities } = useActivities();
  const { enabled, setEnabled, isOnline, isSyncing, lastSync, syncNow, token, setToken } = useSync();
  const [tokenInput, setTokenInput] = useState('');
  const navigation = useNavigation<any>();

  const handleExport = async () => {
    try {
      const json = JSON.stringify(activities, null, 2);
      const file = new File(Paths.cache, 'explore_backup.json');
      await file.write(json);
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: 'Exporter Explore',
      });
    } catch {
      Alert.alert('Erreur', 'Impossible d\'exporter les données.');
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (result.canceled) return;
      const file = new File(result.assets[0].uri);
      const content = await file.text();
      const data = JSON.parse(content);
      if (!Array.isArray(data)) {
        Alert.alert('Erreur', 'Format de fichier invalide.');
        return;
      }
      Alert.alert('Importer', `${data.length} activités trouvées. Fonctionnalité à venir.`);
    } catch {
      Alert.alert('Erreur', 'Impossible de lire le fichier.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.separator }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={theme.accent} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Paramètres</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Apparence</Text>
        <View style={[styles.card, { backgroundColor: theme.glassBg, borderColor: theme.glassBorder, borderWidth: 1 }]}>
          <Text style={[styles.cardLabel, { color: theme.text }]}>Thème</Text>
          <View style={styles.themeRow}>
            {(['light', 'dark', 'auto'] as const).map(t => (
              <Pressable
                key={t}
                onPress={() => updateSettings({ theme: t })}
                style={[
                  styles.themeBtn,
                  {
                    backgroundColor: settings.theme === t ? theme.accent + '20' : theme.searchBackground,
                    borderColor: settings.theme === t ? theme.accent : 'transparent',
                    borderWidth: 2,
                  },
                ]}
              >
                <MaterialIcons
                  name={t === 'light' ? 'light-mode' : t === 'dark' ? 'dark-mode' : 'brightness-auto'}
                  size={22}
                  color={settings.theme === t ? theme.accent : theme.textSecondary}
                />
                <Text style={[styles.themeBtnText, { color: settings.theme === t ? theme.accent : theme.textSecondary }]}>
                  {t === 'light' ? 'Clair' : t === 'dark' ? 'Sombre' : 'Auto'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.glassBg, borderColor: theme.glassBorder, borderWidth: 1 }]}>
          <Text style={[styles.cardLabel, { color: theme.text }]}>Couleur principale</Text>
          <View style={styles.colorRow}>
            {COLORS.map(c => (
              <Pressable
                key={c}
                onPress={() => updateSettings({ primaryColor: c })}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: c },
                  settings.primaryColor === c && styles.colorSwatchActive,
                ]}
              >
                {settings.primaryColor === c && <MaterialIcons name="check" size={16} color="#fff" />}
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.glassBg, borderColor: theme.glassBorder, borderWidth: 1 }]}>
          <Text style={[styles.cardLabel, { color: theme.text }]}>Taille des cartes</Text>
          <View style={styles.themeRow}>
            {(['small', 'medium', 'large'] as const).map(s => (
              <Pressable
                key={s}
                onPress={() => updateSettings({ cardSize: s })}
                style={[
                  styles.themeBtn,
                  {
                    backgroundColor: settings.cardSize === s ? theme.accent + '20' : theme.searchBackground,
                    borderColor: settings.cardSize === s ? theme.accent : 'transparent',
                    borderWidth: 2,
                  },
                ]}
              >
                <Text style={[styles.themeBtnText, { color: settings.cardSize === s ? theme.accent : theme.textSecondary }]}>
                  {s === 'small' ? 'Petites' : s === 'medium' ? 'Moyennes' : 'Grandes'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Synchronisation</Text>
        <View style={[styles.card, { backgroundColor: theme.glassBg, borderColor: theme.glassBorder, borderWidth: 1 }]}>
          <Text style={[styles.cardLabel, { color: theme.text }]}>Token GitHub</Text>
          <Text style={[styles.cardSubLabel, { color: theme.textTertiary }]}>
            Crée un token sur github.com/settings/tokens (scope: gist)
          </Text>
          <View style={styles.tokenRow}>
            <TextInput
              style={[styles.tokenInput, { backgroundColor: theme.searchBackground, color: theme.text, borderColor: theme.separator }]}
              value={tokenInput}
              onChangeText={setTokenInput}
              placeholder={token ? '••••••••••••' : 'ghp_xxx...'}
              placeholderTextColor={theme.textTertiary}
              secureTextEntry
              autoCapitalize="none"
            />
            <Pressable
              onPress={() => { if (tokenInput.trim()) setToken(tokenInput.trim()); }}
              style={[styles.tokenBtn, { backgroundColor: theme.accent }]}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>OK</Text>
            </Pressable>
          </View>
          {token ? (
            <>
              <View style={[styles.separator, { backgroundColor: theme.separator }]} />
              <Pressable style={styles.settingsRow} onPress={() => setEnabled(!enabled)}>
                <MaterialIcons name={enabled ? 'cloud-done' : 'cloud-off'} size={20} color={enabled ? theme.success : theme.textSecondary} />
                <Text style={[styles.settingsLabel, { color: theme.text }]}>Sync GitHub Gist</Text>
                <View style={[styles.toggle, { backgroundColor: enabled ? theme.success : theme.searchBackground }]}>
                  <View style={[styles.toggleKnob, { transform: [{ translateX: enabled ? 20 : 0 }] }]} />
                </View>
              </Pressable>
              {enabled && (
                <>
                  <View style={[styles.separator, { backgroundColor: theme.separator }]} />
                  <View style={styles.settingsRow}>
                    <MaterialIcons name={isOnline ? 'wifi' : 'wifi-off'} size={20} color={isOnline ? theme.success : theme.destructive} />
                    <Text style={[styles.settingsLabel, { color: theme.textSecondary }]}>
                      {isOnline ? 'En ligne' : 'Hors ligne'}
                    </Text>
                    {isSyncing && (
                      <MaterialIcons name="sync" size={18} color={theme.accent} style={{ opacity: 0.6 }} />
                    )}
                  </View>
                  {lastSync && (
                    <>
                      <View style={[styles.separator, { backgroundColor: theme.separator }]} />
                      <Pressable style={styles.settingsRow} onPress={syncNow}>
                        <MaterialIcons name="schedule" size={20} color={theme.textSecondary} />
                        <Text style={[styles.settingsLabel, { color: theme.textSecondary }]}>
                          Dernière sync: {new Date(lastSync).toLocaleTimeString('fr-FR')}
                        </Text>
                        <MaterialIcons name="refresh" size={18} color={theme.accent} />
                      </Pressable>
                    </>
                  )}
                </>
              )}
            </>
          ) : null}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Données</Text>
        <View style={[styles.card, { backgroundColor: theme.glassBg, borderColor: theme.glassBorder, borderWidth: 1 }]}>
          <Pressable style={styles.settingsRow} onPress={handleExport}>
            <MaterialIcons name="file-download" size={20} color={theme.accent} />
            <Text style={[styles.settingsLabel, { color: theme.text }]}>Exporter (JSON)</Text>
            <MaterialIcons name="chevron-right" size={20} color={theme.textTertiary} />
          </Pressable>
          <View style={[styles.separator, { backgroundColor: theme.separator }]} />
          <Pressable style={styles.settingsRow} onPress={handleImport}>
            <MaterialIcons name="file-upload" size={20} color={theme.accent} />
            <Text style={[styles.settingsLabel, { color: theme.text }]}>Importer (JSON)</Text>
            <MaterialIcons name="chevron-right" size={20} color={theme.textTertiary} />
          </Pressable>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>À propos</Text>
        <View style={[styles.card, { backgroundColor: theme.glassBg, borderColor: theme.glassBorder, borderWidth: 1 }]}>
          <View style={styles.settingsRow}>
            <MaterialIcons name="explore" size={20} color={theme.accent} />
            <Text style={[styles.settingsLabel, { color: theme.text }]}>Explore</Text>
            <Text style={[styles.versionText, { color: theme.textTertiary }]}>v1.0.0</Text>
          </View>
          <View style={[styles.separator, { backgroundColor: theme.separator }]} />
          <View style={styles.settingsRow}>
            <MaterialIcons name="storage" size={20} color={theme.textSecondary} />
            <Text style={[styles.settingsLabel, { color: theme.textSecondary }]}>
              {activities.length} activités enregistrées
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginTop: 20, marginBottom: 10 },
  card: { borderRadius: 16, padding: 16, marginBottom: 8 },
  cardLabel: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  cardSubLabel: { fontSize: 12, marginBottom: 12 },
  themeRow: { flexDirection: 'row', gap: 8 },
  themeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  themeBtnText: { fontSize: 13, fontWeight: '600' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSwatchActive: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  settingsLabel: { fontSize: 15, flex: 1 },
  versionText: { fontSize: 14 },
  separator: { height: StyleSheet.hairlineWidth },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  tokenRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  tokenInput: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
  },
  tokenBtn: {
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
  },
});
