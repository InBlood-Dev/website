import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import {
  getAuth,
  Auth,
  signInWithCustomToken,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

const firebaseConfigValid = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.databaseURL &&
  firebaseConfig.projectId
);

console.log("[FB Config] valid:", firebaseConfigValid,
  "apiKey:", firebaseConfig.apiKey ? "set" : "MISSING",
  "dbURL:", firebaseConfig.databaseURL ? "set" : "MISSING",
  "projectId:", firebaseConfig.projectId ? "set" : "MISSING"
);

let app: FirebaseApp | null = null;
let database: Database | null = null;
let auth: Auth | null = null;

export const initializeFirebase = () => {
  if (!firebaseConfigValid) {
    console.warn("[Firebase] Configuration missing");
    return { app: null, database: null, auth: null };
  }

  if (app && database && auth) {
    return { app, database, auth };
  }

  try {
    if (!app) {
      const existingApps = getApps();
      app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);
    }
    if (!database) {
      database = getDatabase(app);
    }
    if (!auth) {
      auth = getAuth(app);
      setPersistence(auth, browserLocalPersistence).catch(console.error);
    }
    return { app, database, auth };
  } catch (error) {
    console.error("[Firebase] Initialization failed:", error);
    throw error;
  }
};

export const getFirebaseDatabase = (): Database => {
  if (!firebaseConfigValid) {
    throw new Error("[Firebase] Configuration missing");
  }
  if (!database) initializeFirebase();
  return database!;
};

export const getFirebaseAuth = (): Auth => {
  if (!firebaseConfigValid) {
    throw new Error("[Firebase] Configuration missing");
  }
  if (!auth) initializeFirebase();
  return auth!;
};

export const authenticateFirebase = async (
  customToken: string
): Promise<void> => {
  const authInstance = getFirebaseAuth();
  await signInWithCustomToken(authInstance, customToken);
};

export const signOutFirebase = async (): Promise<void> => {
  const authInstance = getFirebaseAuth();
  await authInstance.signOut();
};
