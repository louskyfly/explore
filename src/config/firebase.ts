import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'REMPLACER_PAR_TA_CLE',
  authDomain: 'REMPLACER_PAR_TON_PROJECT.firebaseapp.com',
  projectId: 'REMPLACER_PAR_TON_PROJECT',
  storageBucket: 'REMPLACER_PAR_TON_PROJECT.appspot.com',
  messagingSenderId: 'REMPLACER_PAR_TON_SENDER_ID',
  appId: 'REMPLACER_PAR_TON_APP_ID',
};

let app: ReturnType<typeof initializeApp>;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);

try {
  enableMultiTabIndexedDbPersistence(db).catch(() => {});
} catch {}

export { app, db };
