import { get } from "../api/client";
import { onAuthStateChanged } from "firebase/auth";
import {
  authenticateFirebase,
  signOutFirebase,
  initializeFirebase,
} from "./config";

interface FirebaseTokenResponse {
  firebase_token: string;
  expires_in: number;
}

let firebaseToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Resolves when Firebase Auth has a signed-in user.
 * Checks both: (a) the in-memory token we fetched, and
 * (b) Firebase Auth's persisted state (browserLocalPersistence).
 * If no auth is in progress, actively triggers token fetch.
 * Has a 15-second timeout so it never hangs forever.
 */
let _authInProgress: Promise<void> | null = null;

export const waitForFirebaseAuth = (): Promise<void> => {
  // Fast path: we already have a token from this session
  if (firebaseToken) return Promise.resolve();

  // Check if Firebase Auth already has a persisted user
  const { auth } = initializeFirebase();
  if (!auth) return Promise.reject(new Error("Firebase not configured"));
  if (auth.currentUser) return Promise.resolve();

  // If no auth attempt is in progress, actively trigger one
  if (!_authInProgress) {
    _authInProgress = getFirebaseToken()
      .then(() => {})
      .catch(() => {})
      .finally(() => { _authInProgress = null; });
  }

  // Wait for Firebase Auth to restore persisted state OR for our token fetch
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      unsub();
      reject(new Error("Firebase auth timeout"));
    }, 15000);

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        clearTimeout(timeout);
        unsub();
        resolve();
      }
    });
  });
};

export const getFirebaseToken = async (): Promise<string> => {
  if (firebaseToken && tokenExpiry && Date.now() < tokenExpiry) {
    return firebaseToken;
  }

  const response = await get<FirebaseTokenResponse>("/auth/firebase-token");

  if (!response.success || !response.data) {
    throw new Error(response.message || "Failed to get Firebase token");
  }

  firebaseToken = response.data.firebase_token;
  tokenExpiry = Date.now() + response.data.expires_in * 1000 - 60000;

  await authenticateFirebase(firebaseToken);
  return firebaseToken;
};

export const initializeFirebaseAuth = async (): Promise<void> => {
  await getFirebaseToken();
};

export const clearFirebaseAuth = async (): Promise<void> => {
  try {
    await signOutFirebase();
  } catch {
    // continue logout even if Firebase signout fails
  }
  firebaseToken = null;
  tokenExpiry = null;
};

export const refreshFirebaseToken = async (): Promise<string> => {
  firebaseToken = null;
  tokenExpiry = null;
  return getFirebaseToken();
};
