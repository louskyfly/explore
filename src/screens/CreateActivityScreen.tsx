import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Pressable,
  Alert, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useActivities } from '../contexts/ActivityContext';
import { useProfile } from '../contexts/ProfileContext';
import {
  Activity, Category, Priority, Status, Photo,
  CATEGORIES, PRIORITIES, STATUSES, getCategoryInfo,
} from '../types/activity';

export function CreateActivityScreen() {
  const { theme } = useTheme();
  const { addActivity, updateActivity } = useActivities();
  const { currentProfile } = useProfile();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editId = route.params?.activityId as string | undefined;
  const existing = route.params?.activity as Activity | undefined;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [category, setCategory] = useState<Category>('autre');
  const [placeName, setPlaceName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<Status>('todo');
  const [plannedDate, setPlannedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [link, setLink] = useState('');
  const [budget, setBudget] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setDescription(existing.description);
      setPhotos(existing.photos);
      setCategory(existing.category);
      setPlaceName(existing.placeName);
      setCity(existing.city);
      setCountry(existing.country);
      setLatitude(existing.latitude);
      setLongitude(existing.longitude);
      setPriority(existing.priority);
      setStatus(existing.status);
      setPlannedDate(existing.plannedDate || '');
      setNotes(existing.notes);
      setLink(existing.link || '');
      setBudget(existing.budget?.toString() || '');
      setEstimatedTime(existing.estimatedTime || '');
    }
  }, [existing]);

  const pickImages = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission requise', 'Autorisez l\'accès à vos photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const newPhotos = result.assets.map((a, i) => ({
        uri: a.uri,
        isMain: photos.length === 0 && i === 0,
      }));
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission requise', 'Autorisez l\'accès à votre caméra.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      const newPhoto = { uri: result.assets[0].uri, isMain: photos.length === 0 };
      setPhotos(prev => [...prev, newPhoto]);
    }
  };

  const openMapPicker = () => {
    navigation.navigate('LocationPicker', {
      onSelect: (data: { latitude: number; longitude: number; city: string; country: string }) => {
        setLatitude(data.latitude);
        setLongitude(data.longitude);
        if (data.city) setCity(data.city);
        if (data.country) setCountry(data.country);
      },
    });
  };

  const setMainPhoto = (index: number) => {
    setPhotos(prev => prev.map((p, i) => ({ ...p, isMain: i === index })));
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Le titre est requis.');
      return;
    }
    const now = new Date().toISOString();
    const activity: Activity = {
      id: editId || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      profile: existing?.profile || currentProfile || 'papa',
      title: title.trim(),
      description: description.trim(),
      photos,
      category,
      placeName: placeName.trim(),
      city: city.trim(),
      country: country.trim(),
      latitude,
      longitude,
      priority,
      status,
      plannedDate: plannedDate.trim() || undefined,
      notes: notes.trim(),
      link: link.trim() || undefined,
      budget: budget ? parseFloat(budget) : undefined,
      estimatedTime: estimatedTime.trim() || undefined,
      isFavorite: existing?.isFavorite || false,
      isArchived: existing?.isArchived || false,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      order: existing?.order || 0,
    };

    if (editId) {
      await updateActivity(activity);
    } else {
      await addActivity(activity);
    }
    navigation.goBack();
  };

  const inputStyle = [styles.input, { backgroundColor: theme.searchBackground, color: theme.text }];
  const sectionLabel = [styles.sectionLabel, { color: theme.textSecondary }];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, { borderBottomColor: theme.separator }]}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={[styles.cancelText, { color: theme.accent }]}>Annuler</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {editId ? 'Modifier' : 'Nouvelle activité'}
          </Text>
          <Pressable onPress={handleSave}>
            <Text style={[styles.saveText, { color: theme.accent }]}>Enregistrer</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Text style={sectionLabel}>Titre *</Text>
          <TextInput style={inputStyle} value={title} onChangeText={setTitle} placeholder="Nom de l'activité" placeholderTextColor={theme.textTertiary} />

          <Text style={sectionLabel}>Description</Text>
          <TextInput
            style={[inputStyle, styles.multiline]}
            value={description}
            onChangeText={setDescription}
            placeholder="Décrivez cette activité..."
            placeholderTextColor={theme.textTertiary}
            multiline
            numberOfLines={3}
          />

          <Text style={sectionLabel}>Photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
            {photos.map((p, i) => (
              <Pressable key={i} onPress={() => setMainPhoto(i)} onLongPress={() => removePhoto(i)}>
                <View style={[styles.photoThumb, p.isMain && { borderColor: theme.accent, borderWidth: 2 }]}>
                  <Image source={{ uri: p.uri }} style={styles.photoImg} />
                  {p.isMain && (
                    <View style={[styles.mainBadge, { backgroundColor: theme.accent }]}>
                      <MaterialIcons name="star" size={12} color="#fff" />
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
            <View style={styles.photoActions}>
              <Pressable style={[styles.photoActionBtn, { backgroundColor: theme.searchBackground }]} onPress={takePhoto}>
                <MaterialIcons name="camera-alt" size={24} color={theme.accent} />
              </Pressable>
              <Pressable style={[styles.photoActionBtn, { backgroundColor: theme.searchBackground }]} onPress={pickImages}>
                <MaterialIcons name="photo-library" size={24} color={theme.accent} />
              </Pressable>
            </View>
          </ScrollView>

          <Text style={sectionLabel}>Catégorie</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map(c => (
              <Pressable
                key={c.key}
                onPress={() => setCategory(c.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: category === c.key ? c.color + '25' : theme.searchBackground,
                    borderColor: category === c.key ? c.color : 'transparent',
                    borderWidth: 1.5,
                  },
                ]}
              >
                <MaterialIcons name={c.icon as any} size={16} color={category === c.key ? c.color : theme.textSecondary} />
                <Text style={[styles.chipText, { color: category === c.key ? c.color : theme.textSecondary }]}>
                  {c.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={sectionLabel}>Lieu</Text>
          <TextInput style={inputStyle} value={placeName} onChangeText={setPlaceName} placeholder="Nom du lieu" placeholderTextColor={theme.textTertiary} />
          <View style={styles.row}>
            <TextInput style={[inputStyle, { flex: 1, marginRight: 8 }]} value={city} onChangeText={setCity} placeholder="Ville" placeholderTextColor={theme.textTertiary} />
            <TextInput style={[inputStyle, { flex: 1 }]} value={country} onChangeText={setCountry} placeholder="Pays" placeholderTextColor={theme.textTertiary} />
          </View>

          <Pressable style={[styles.locationBtn, { backgroundColor: theme.glassBg, borderColor: theme.glassBorder, borderWidth: 1 }]} onPress={openMapPicker}>
            <MaterialIcons name="map" size={18} color={theme.accent} />
            <Text style={[styles.locationBtnText, { color: theme.accent }]}>
              {latitude ? `${latitude.toFixed(4)}, ${longitude!.toFixed(4)} — Modifier` : 'Choisir sur la carte'}
            </Text>
            <MaterialIcons name="chevron-right" size={18} color={theme.textTertiary} />
          </Pressable>

          <Text style={sectionLabel}>Priorité</Text>
          <View style={styles.row}>
            {PRIORITIES.map(p => (
              <Pressable
                key={p.key}
                onPress={() => setPriority(p.key)}
                style={[
                  styles.priorityChip,
                  {
                    backgroundColor: priority === p.key ? p.color + '25' : theme.searchBackground,
                    borderColor: priority === p.key ? p.color : 'transparent',
                    borderWidth: 1.5,
                  },
                ]}
              >
                <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
                <Text style={[styles.chipText, { color: priority === p.key ? p.color : theme.textSecondary }]}>
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={sectionLabel}>Statut</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {STATUSES.map(s => (
              <Pressable
                key={s.key}
                onPress={() => setStatus(s.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: status === s.key ? s.color + '25' : theme.searchBackground,
                    borderColor: status === s.key ? s.color : 'transparent',
                    borderWidth: 1.5,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: status === s.key ? s.color : theme.textSecondary }]}>
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={sectionLabel}>Date prévue</Text>
          <TextInput style={inputStyle} value={plannedDate} onChangeText={setPlannedDate} placeholder="AAAA-MM-JJ" placeholderTextColor={theme.textTertiary} />

          <Text style={sectionLabel}>Budget estimé (€)</Text>
          <TextInput style={inputStyle} value={budget} onChangeText={setBudget} placeholder="0.00" placeholderTextColor={theme.textTertiary} keyboardType="decimal-pad" />

          <Text style={sectionLabel}>Temps estimé</Text>
          <TextInput style={inputStyle} value={estimatedTime} onChangeText={setEstimatedTime} placeholder="ex: 2 heures" placeholderTextColor={theme.textTertiary} />

          <Text style={sectionLabel}>Lien internet</Text>
          <TextInput style={inputStyle} value={link} onChangeText={setLink} placeholder="https://..." placeholderTextColor={theme.textTertiary} keyboardType="url" autoCapitalize="none" />

          <Text style={sectionLabel}>Notes</Text>
          <TextInput
            style={[inputStyle, styles.multiline]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Notes personnelles..."
            placeholderTextColor={theme.textTertiary}
            multiline
            numberOfLines={4}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  headerTitle: { fontSize: 17, fontWeight: '700' },
  cancelText: { fontSize: 16 },
  saveText: { fontSize: 16, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginTop: 20, marginBottom: 8 },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  photoScroll: { marginBottom: 8 },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 8,
    overflow: 'hidden',
    borderColor: 'transparent',
  },
  photoImg: { width: '100%', height: '100%' },
  mainBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    borderRadius: 10,
    padding: 2,
  },
  photoActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  photoActionBtn: { width: 80, height: 80, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 4,
  },
  locationBtnText: { fontSize: 14, fontWeight: '600' },
  priorityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
});