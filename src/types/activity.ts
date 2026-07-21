export type Profile = 'papa' | 'maman';

export const PROFILES: { key: Profile; label: string; icon: string; color: string; pin: string }[] = [
  { key: 'papa', label: 'Papa', icon: 'person', color: '#42A5F5', pin: '0212' },
  { key: 'maman', label: 'Maman', icon: 'person', color: '#EC407A', pin: '1412' },
];

export function getProfileInfo(p: Profile) {
  return PROFILES.find(pr => pr.key === p) || PROFILES[0];
}

export type Category =
  | 'restaurant'
  | 'parc_attractions'
  | 'voyage'
  | 'randonnee'
  | 'drone'
  | 'photographie'
  | 'urbex'
  | 'plage'
  | 'musee'
  | 'sport'
  | 'shopping'
  | 'road_trip'
  | 'nature'
  | 'autre';

export type Priority = 'low' | 'medium' | 'high';

export type Status = 'todo' | 'planned' | 'reserved' | 'done' | 'cancelled';

export type ViewMode = 'list' | 'grid' | 'large_cards' | 'small_cards' | 'timeline';

export interface Photo {
  uri: string;
  isMain: boolean;
}

export interface Activity {
  id: string;
  profile: Profile;
  title: string;
  description: string;
  photos: Photo[];
  category: Category;
  placeName: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  priority: Priority;
  status: Status;
  plannedDate?: string;
  notes: string;
  link?: string;
  budget?: number;
  estimatedTime?: string;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  order: number;
}

export interface Settings {
  primaryColor: string;
  secondaryColor: string;
  theme: 'light' | 'dark' | 'auto';
  cardSize: 'small' | 'medium' | 'large';
}

export const CATEGORIES: { key: Category; label: string; icon: string; color: string }[] = [
  { key: 'restaurant', label: 'Restaurant', icon: 'restaurant', color: '#FF6B6B' },
  { key: 'parc_attractions', label: 'Parc d attractions', icon: 'roller-coaster', color: '#FFA726' },
  { key: 'voyage', label: 'Voyage', icon: 'flight', color: '#42A5F5' },
  { key: 'randonnee', label: 'Randonnée', icon: 'terrain', color: '#66BB6A' },
  { key: 'drone', label: 'Drone', icon: 'videocam', color: '#7E57C2' },
  { key: 'photographie', label: 'Photographie', icon: 'photo-camera', color: '#EC407A' },
  { key: 'urbex', label: 'Urbex', icon: 'location-city', color: '#78909C' },
  { key: 'plage', label: 'Plage', icon: 'beach-access', color: '#26C6DA' },
  { key: 'musee', label: 'Musée', icon: 'museum', color: '#AB47BC' },
  { key: 'sport', label: 'Sport', icon: 'sports', color: '#EF5350' },
  { key: 'shopping', label: 'Shopping', icon: 'shopping-bag', color: '#FF7043' },
  { key: 'road_trip', label: 'Road trip', icon: 'directions-car', color: '#5C6BC0' },
  { key: 'nature', label: 'Nature', icon: 'nature', color: '#26A69A' },
  { key: 'autre', label: 'Autre', icon: 'star', color: '#BDBDBD' },
];

export const PRIORITIES: { key: Priority; label: string; color: string }[] = [
  { key: 'low', label: 'Faible', color: '#66BB6A' },
  { key: 'medium', label: 'Moyenne', color: '#FFA726' },
  { key: 'high', label: 'Haute', color: '#EF5350' },
];

export const STATUSES: { key: Status; label: string; color: string }[] = [
  { key: 'todo', label: 'À faire', color: '#90A4AE' },
  { key: 'planned', label: 'Prévu', color: '#42A5F5' },
  { key: 'reserved', label: 'Réservé', color: '#AB47BC' },
  { key: 'done', label: 'Terminé', color: '#66BB6A' },
  { key: 'cancelled', label: 'Annulé', color: '#EF5350' },
];

export function getCategoryInfo(cat: Category) {
  return CATEGORIES.find(c => c.key === cat) || CATEGORIES[CATEGORIES.length - 1];
}

export function getPriorityInfo(p: Priority) {
  return PRIORITIES.find(pr => pr.key === p) || PRIORITIES[0];
}

export function getStatusInfo(s: Status) {
  return STATUSES.find(st => st.key === s) || STATUSES[0];
}
