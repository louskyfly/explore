import { Activity, Profile } from '../types/activity';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'github_token';
const GIST_ID_KEY = 'github_gist_id';
const FILE_NAME = 'explore_activities.json';

export async function getToken(): Promise<string | null> {
  try { return await AsyncStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getGistId(): Promise<string | null> {
  try { return await AsyncStorage.getItem(GIST_ID_KEY); } catch { return null; }
}

async function apiFetch(url: string, method: string, body?: any): Promise<any> {
  const token = await getToken();
  if (!token) throw new Error('Token GitHub manquant');
  const res = await fetch(url, {
    method,
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github+json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function createGist(activities: Activity[]): Promise<string> {
  const data: Record<string, Activity[]> = {};
  for (const a of activities) {
    if (!data[a.profile]) data[a.profile] = [];
    data[a.profile].push(a);
  }
  const result = await apiFetch('https://api.github.com/gists', 'POST', {
    description: 'Explore Activities Sync',
    public: false,
    files: {
      [FILE_NAME]: { content: JSON.stringify(data, null, 2) },
    },
  });
  await AsyncStorage.setItem(GIST_ID_KEY, result.id);
  return result.id;
}

export async function pushToGist(activities: Activity[]): Promise<void> {
  let gistId = await getGistId();
  if (!gistId) {
    gistId = await createGist(activities);
    return;
  }
  const data: Record<string, Activity[]> = {};
  for (const a of activities) {
    if (!data[a.profile]) data[a.profile] = [];
    data[a.profile].push(a);
  }
  await apiFetch(`https://api.github.com/gists/${gistId}`, 'PATCH', {
    files: {
      [FILE_NAME]: { content: JSON.stringify(data, null, 2) },
    },
  });
}

export async function pullFromGist(profile: Profile): Promise<Activity[]> {
  const gistId = await getGistId();
  if (!gistId) return [];
  try {
    const gist = await apiFetch(`https://api.github.com/gists/${gistId}`, 'GET');
    const file = gist.files?.[FILE_NAME];
    if (!file?.content) return [];
    const all: Record<string, Activity[]> = JSON.parse(file.content);
    return all[profile] || [];
  } catch {
    return [];
  }
}

export async function pullAllFromGist(): Promise<Activity[]> {
  const gistId = await getGistId();
  if (!gistId) return [];
  try {
    const gist = await apiFetch(`https://api.github.com/gists/${gistId}`, 'GET');
    const file = gist.files?.[FILE_NAME];
    if (!file?.content) return [];
    const all: Record<string, Activity[]> = JSON.parse(file.content);
    return Object.values(all).flat();
  } catch {
    return [];
  }
}

export async function deleteFromGist(): Promise<void> {
  const gistId = await getGistId();
  if (!gistId) return;
  try {
    await apiFetch(`https://api.github.com/gists/${gistId}`, 'DELETE');
    await AsyncStorage.removeItem(GIST_ID_KEY);
  } catch {}
}
