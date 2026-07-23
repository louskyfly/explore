import { Activity, Profile } from '../types/activity';

const PROJECT_ID = 'explore-sync';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const COLLECTION = 'activities';

interface FirestoreDoc {
  name: string;
  fields: Record<string, any>;
}

function toFirestoreFields(a: Activity) {
  return {
    id: { stringValue: a.id },
    profile: { stringValue: a.profile },
    title: { stringValue: a.title },
    description: { stringValue: a.description },
    photos: { stringValue: JSON.stringify(a.photos) },
    category: { stringValue: a.category },
    placeName: { stringValue: a.placeName },
    city: { stringValue: a.city },
    country: { stringValue: a.country },
    latitude: a.latitude != null ? { doubleValue: a.latitude } : { nullValue: null },
    longitude: a.longitude != null ? { doubleValue: a.longitude } : { nullValue: null },
    priority: { stringValue: a.priority },
    status: { stringValue: a.status },
    plannedDate: a.plannedDate ? { stringValue: a.plannedDate } : { nullValue: null },
    notes: { stringValue: a.notes },
    link: a.link ? { stringValue: a.link } : { nullValue: null },
    budget: a.budget != null ? { doubleValue: a.budget } : { nullValue: null },
    estimatedTime: a.estimatedTime ? { stringValue: a.estimatedTime } : { nullValue: null },
    isFavorite: { booleanValue: a.isFavorite },
    isArchived: { booleanValue: a.isArchived },
    createdAt: { stringValue: a.createdAt },
    updatedAt: { stringValue: a.updatedAt },
    order: { integerValue: String(a.order) },
  };
}

function fromFirestoreFields(fields: Record<string, any>): Activity {
  const str = (k: string) => fields[k]?.stringValue || '';
  const num = (k: string) => fields[k]?.doubleValue ?? fields[k]?.integerValue ? Number(fields[k].integerValue || fields[k].doubleValue) : undefined;
  return {
    id: str('id'),
    profile: (str('profile') as Profile) || 'papa',
    title: str('title'),
    description: str('description'),
    photos: JSON.parse(str('photos') || '[]'),
    category: str('category') as any || 'autre',
    placeName: str('placeName'),
    city: str('city'),
    country: str('country'),
    latitude: num('latitude'),
    longitude: num('longitude'),
    priority: str('priority') as any || 'medium',
    status: str('status') as any || 'todo',
    plannedDate: str('plannedDate') || undefined,
    notes: str('notes'),
    link: str('link') || undefined,
    budget: num('budget'),
    estimatedTime: str('estimatedTime') || undefined,
    isFavorite: fields.isFavorite?.booleanValue || false,
    isArchived: fields.isArchived?.booleanValue || false,
    createdAt: str('createdAt'),
    updatedAt: str('updatedAt'),
    order: num('order') || 0,
  };
}

export async function pushActivity(activity: Activity): Promise<void> {
  const url = `${BASE_URL}/${COLLECTION}/${activity.id}`;
  const body = { fields: toFirestoreFields(activity) };
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Push failed: ${res.status}`);
}

export async function pullActivities(profile: Profile): Promise<Activity[]> {
  const url = `${BASE_URL}/${COLLECTION}`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: COLLECTION }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'profile' },
          op: 'EQUAL',
          value: { stringValue: profile },
        },
      },
    },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Pull failed: ${res.status}`);
  const data = await res.json();
  return (data.document || []).map((doc: FirestoreDoc) => fromFirestoreFields(doc.fields));
}

export async function removeActivity(id: string): Promise<void> {
  const url = `${BASE_URL}/${COLLECTION}/${id}`;
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
}

export async function pullAllActivities(): Promise<Activity[]> {
  const url = `${BASE_URL}/${COLLECTION}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Pull all failed: ${res.status}`);
  const data = await res.json();
  return (data.document || []).map((doc: FirestoreDoc) => fromFirestoreFields(doc.fields));
}
