import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, Pressable,
  RefreshControl, Dimensions, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useActivities } from '../contexts/ActivityContext';
import { useProfile } from '../contexts/ProfileContext';
import { useSync } from '../contexts/SyncContext';
import { GlassCard } from '../components/GlassCard';
import { CategoryBadge } from '../components/CategoryBadge';
import { StatusBadge } from '../components/StatusBadge';
import {
  Activity, Category, Priority, Status, ViewMode,
  getCategoryInfo, getPriorityInfo, CATEGORIES, PRIORITIES, STATUSES,
} from '../types/activity';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export function HomeScreen() {
  const { theme, isDark } = useTheme();
  const { filtered, loading, filters, setFilters, refresh, toggleFavorite } = useActivities();
  const { currentProfile, logout, getProfileInfo } = useProfile();
  const { isSyncing, enabled, setEnabled, syncNow } = useSync();
  const navigation = useNavigation<any>();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const getCardWidth = () => {
    switch (viewMode) {
      case 'grid': return (width - 48) / 2;
      case 'list': return width - 32;
      case 'large_cards': return width - 32;
      case 'small_cards': return (width - 48) / 2;
      case 'timeline': return width - 64;
      default: return (width - 48) / 2;
    }
  };

  const renderCard = ({ item, index }: { item: Activity; index: number }) => {
    const catInfo = getCategoryInfo(item.category);
    const priInfo = getPriorityInfo(item.priority);
    const mainPhoto = item.photos.find(p => p.isMain) || item.photos[0];
    const isGrid = viewMode === 'grid' || viewMode === 'small_cards';
    const isLarge = viewMode === 'large_cards';
    const cardW = getCardWidth();
    const isDone = item.status === 'done';

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 50).springify().damping(15)}
        layout={Layout.springify()}
        style={{
          width: cardW,
          marginBottom: 12,
          marginHorizontal: isGrid ? 6 : 0,
          opacity: isDone ? 0.72 : 1,
        }}
      >
        <GlassCard onPress={() => navigation.navigate('Detail', { id: item.id })}>
          <View style={styles.cardInner}>
            <View style={[
              styles.accentBar,
              { backgroundColor: isDone ? theme.success : catInfo.color },
            ]} />
            <View style={{ flex: 1 }}>
              {mainPhoto && (
                <View style={[styles.photoContainer, { height: isLarge ? 200 : isGrid ? 120 : 100 }]}>
                  <View style={[StyleSheet.absoluteFill, {
                    backgroundColor: isDone ? theme.success + '15' : catInfo.color + '30',
                  }]} />
                  {isDone ? (
                    <View style={styles.doneOverlay}>
                      <MaterialIcons name="check-circle" size={isLarge ? 48 : 32} color={theme.success} />
                    </View>
                  ) : (
                    <MaterialIcons name={catInfo.icon as any} size={isLarge ? 48 : 32} color={catInfo.color} style={styles.cardIcon} />
                  )}
                </View>
              )}
              {!mainPhoto && (
                <View style={[styles.photoContainer, {
                  height: isLarge ? 200 : isGrid ? 120 : 100,
                  backgroundColor: isDone ? theme.success + '10' : catInfo.color + '15',
                }]}>
                  {isDone ? (
                    <MaterialIcons name="check-circle" size={isLarge ? 48 : 32} color={theme.success} />
                  ) : (
                    <MaterialIcons name={catInfo.icon as any} size={isLarge ? 48 : 32} color={catInfo.color} />
                  )}
                </View>
              )}
              <View style={styles.cardBody}>
                <View style={styles.cardTopRow}>
                  <Text
                    style={[
                      styles.cardTitle,
                      { color: theme.text },
                      isDone && styles.doneTitle,
                    ]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <View style={styles.topRight}>
                    {isDone && (
                      <View style={[styles.doneBadge, { backgroundColor: theme.success + '20' }]}>
                        <MaterialIcons name="check" size={12} color={theme.success} />
                      </View>
                    )}
                    <Pressable onPress={() => toggleFavorite(item.id)}>
                      <MaterialIcons
                        name={item.isFavorite ? 'favorite' : 'favorite-border'}
                        size={18}
                        color={item.isFavorite ? '#FF3B30' : theme.textTertiary}
                      />
                    </Pressable>
                  </View>
                </View>
                {!isGrid && item.description ? (
                  <Text style={[styles.cardDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
                <View style={styles.cardMeta}>
                  <CategoryBadge category={item.category} size="small" />
                  {item.city ? (
                    <Text style={[styles.cityText, { color: theme.textTertiary }]} numberOfLines={1}>
                      {item.city}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.cardBottom}>
                  <StatusBadge status={item.status} />
                  <View style={[styles.priorityDot, { backgroundColor: priInfo.color }]} />
                </View>
              </View>
            </View>
          </View>
        </GlassCard>
      </Animated.View>
    );
  };

  const viewModes: { mode: ViewMode; icon: string }[] = [
    { mode: 'grid', icon: 'grid-view' },
    { mode: 'list', icon: 'view-list' },
    { mode: 'large_cards', icon: 'view-agenda' },
    { mode: 'small_cards', icon: 'dashboard' },
    { mode: 'timeline', icon: 'timeline' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Glass Header */}
      <View style={styles.headerWrap}>
        <LinearGradient
          colors={isDark
            ? ['rgba(30,30,32,0.55)', 'rgba(30,30,32,0.35)']
            : ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.25)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.headerBg}
        />
        {/* Prismatic bottom edge */}
        <LinearGradient
          colors={isDark
            ? ['rgba(140,170,255,0.12)', 'rgba(200,180,255,0.06)', 'transparent']
            : ['rgba(180,210,255,0.25)', 'rgba(220,200,255,0.12)', 'transparent']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerPrism}
        />
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Explore</Text>
            <Pressable
              onPress={logout}
              style={[styles.profileBadge, { backgroundColor: (getProfileInfo()?.color || theme.accent) + '18' }]}
            >
              <Text style={[styles.profileBadgeText, { color: getProfileInfo()?.color || theme.accent }]}>
                {getProfileInfo()?.label || ''}
              </Text>
            </Pressable>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => { if (enabled) syncNow(); else setEnabled(true); }}
              style={[styles.headerBtn, {
                backgroundColor: enabled
                  ? (isSyncing ? theme.accent + '30' : theme.success + '20')
                  : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.45)'),
              }]}
            >
              <MaterialIcons
                name={isSyncing ? 'sync' : enabled ? 'cloud-done' : 'cloud-off'}
                size={20}
                color={enabled ? (isSyncing ? theme.accent : theme.success) : theme.textTertiary}
              />
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Map')} style={[styles.headerBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.45)' }]}>
              <MaterialIcons name="map" size={20} color={theme.accent} />
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Stats')} style={[styles.headerBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.45)' }]}>
              <MaterialIcons name="bar-chart" size={20} color={theme.accent} />
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Settings')} style={[styles.headerBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.45)' }]}>
              <MaterialIcons name="settings" size={20} color={theme.accent} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Glass Search Bar */}
      <View style={styles.searchWrap}>
        <LinearGradient
          colors={isDark
            ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.03)']
            : ['rgba(255,255,255,0.65)', 'rgba(255,255,255,0.2)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.searchBg}
        />
        <View style={[styles.searchContainer, {
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)',
          borderWidth: 1,
        }]}>
          <MaterialIcons name="search" size={18} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Rechercher..."
            placeholderTextColor={theme.textTertiary}
            value={filters.search}
            onChangeText={s => setFilters({ search: s })}
          />
          {filters.search.length > 0 && (
            <Pressable onPress={() => setFilters({ search: '' })}>
              <MaterialIcons name="close" size={18} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <Pressable
            onPress={() => setShowFilters(!showFilters)}
            style={[
              styles.filterChip,
              {
                backgroundColor: showFilters ? theme.accent + '18' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.4)'),
                borderColor: showFilters ? theme.accent + '60' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)'),
                borderWidth: 1,
              },
            ]}
          >
            <MaterialIcons name="filter-list" size={16} color={showFilters ? theme.accent : theme.textSecondary} />
            <Text style={[styles.filterChipText, { color: showFilters ? theme.accent : theme.textSecondary }]}>
              Filtres
            </Text>
          </Pressable>
          {CATEGORIES.slice(0, 6).map(c => (
            <Pressable
              key={c.key}
              onPress={() => setFilters({ category: filters.category === c.key ? null : c.key })}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filters.category === c.key ? c.color + '18' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.4)'),
                  borderColor: filters.category === c.key ? c.color + '60' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)'),
                  borderWidth: 1,
                },
              ]}
            >
              <Text style={[styles.filterChipText, { color: filters.category === c.key ? c.color : theme.textSecondary }]}>
                {c.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.viewModes}>
          {viewModes.map(vm => (
            <Pressable
              key={vm.mode}
              onPress={() => setViewMode(vm.mode)}
              style={[styles.viewModeBtn, {
                backgroundColor: viewMode === vm.mode ? theme.accent + '18' : 'transparent',
              }]}
            >
              <MaterialIcons
                name={vm.icon as any}
                size={18}
                color={viewMode === vm.mode ? theme.accent : theme.textTertiary}
              />
            </Pressable>
          ))}
        </View>
      </View>

      {showFilters && (
        <View style={[styles.extraFilters, {
          backgroundColor: isDark ? 'rgba(30,30,32,0.45)' : 'rgba(255,255,255,0.35)',
          borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.4)',
        }]}>
          <Text style={[styles.filterSectionTitle, { color: theme.textSecondary }]}>Statut</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            {STATUSES.map(s => (
              <Pressable
                key={s.key}
                onPress={() => setFilters({ status: filters.status === s.key ? null : s.key })}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: filters.status === s.key ? s.color + '18' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.4)'),
                    borderColor: filters.status === s.key ? s.color + '60' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)'),
                    borderWidth: 1,
                  },
                ]}
              >
                <Text style={[styles.filterChipText, { color: filters.status === s.key ? s.color : theme.textSecondary }]}>
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <Text style={[styles.filterSectionTitle, { color: theme.textSecondary }]}>Priorité</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {PRIORITIES.map(p => (
              <Pressable
                key={p.key}
                onPress={() => setFilters({ priority: filters.priority === p.key ? null : p.key })}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: filters.priority === p.key ? p.color + '18' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.4)'),
                    borderColor: filters.priority === p.key ? p.color + '60' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)'),
                    borderWidth: 1,
                  },
                ]}
              >
                <Text style={[styles.filterChipText, { color: filters.priority === p.key ? p.color : theme.textSecondary }]}>
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderCard}
        numColumns={viewMode === 'grid' || viewMode === 'small_cards' ? 2 : 1}
        key={viewMode === 'grid' || viewMode === 'small_cards' ? 'grid' : 'list'}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={viewMode === 'grid' || viewMode === 'small_cards' ? { paddingHorizontal: 6 } : undefined}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <MaterialIcons name="explore" size={64} color={theme.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Aucune activité</Text>
              <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                Appuyez sur + pour ajouter votre première activité
              </Text>
            </View>
          ) : null
        }
      />

      <Pressable
        onPress={() => navigation.navigate('Create')}
        style={[styles.fab, { shadowColor: theme.accent }]}
      >
        <LinearGradient
          colors={[theme.accent, theme.accentSecondary]}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialIcons name="add" size={28} color="#fff" />
        </LinearGradient>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerWrap: {
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerBg: {
    ...StyleSheet.absoluteFill,
  },
  headerPrism: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', gap: 6 },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchWrap: {
    position: 'relative',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  searchBg: {
    ...StyleSheet.absoluteFill,
    borderRadius: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
  filterRow: { marginTop: 12 },
  filterScroll: { paddingHorizontal: 16 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipText: { fontSize: 13, fontWeight: '600' },
  viewModes: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 4,
  },
  viewModeBtn: { padding: 8, borderRadius: 10 },
  extraFilters: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  filterSectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 },
  listContent: { padding: 16, paddingBottom: 100 },
  cardInner: { flexDirection: 'row' },
  accentBar: { width: 4, borderTopLeftRadius: 22, borderBottomLeftRadius: 22 },
  photoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  cardIcon: { opacity: 0.6 },
  cardBody: { flex: 1, padding: 12 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  doneTitle: { textDecorationLine: 'line-through', textDecorationColor: '#34C759' },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  doneBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(52,199,89,0.1)',
  },
  cardDesc: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  cityText: { fontSize: 12 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  empty: { alignItems: 'center', marginTop: 120 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 16 },
  emptySub: { fontSize: 14, marginTop: 8, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  profileBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  syncBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  syncBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
  },
});
