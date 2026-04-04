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
  if (firebaseToken) {
    console.log("[FB Auth] Fast path: token exists");
    return Promise.resolve();
  }

  const { auth } = initializeFirebase();
  if (!auth) {
    console.error("[FB Auth] Not configured (auth is null)");
    return Promise.reject(new Error("Firebase not configured"));
  }
  if (auth.currentUser) {
    console.log("[FB Auth] Fast path: currentUser exists");
    return Promise.resolve();
  }

  console.log("[FB Auth] Waiting for auth...");

  if (!_authInProgress) {
    console.log("[FB Auth] Triggering token fetch");
    _authInProgress = getFirebaseToken()
      .then(() => { console.log("[FB Auth] Token fetch ok"); })
      .catch((err) => { console.error("[FB Auth] Token fetch failed:", err?.message); })
      .finally(() => { _authInProgress = null; });
  }

  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      unsub();
      console.error("[FB Auth] Timed out after 15s");
      reject(new Error("Firebase auth timeout"));
    }, 15000);

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("[FB Auth] Signed in:", user.uid);
        clearTimeout(timeout);
        unsub();
        resolve();
      } else {
        console.log("[FB Auth] State changed: no user yet");
      }
    });
  });
};

export const getFirebaseToken = async (): Promise<string> => {
  if (firebaseToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log("[FB Auth] Using cached token");
    return firebaseToken;
  }

  console.log("[FB Auth] Fetching /auth/firebase-token...");
  const response = await get<FirebaseTokenResponse>("/auth/firebase-token");
  console.log("[FB Auth] Token response:", response.success, response.message || "ok");

  if (!response.success || !response.data) {
    throw new Error(response.message || "Failed to get Firebase token");
  }

  firebaseToken = response.data.firebase_token;
  tokenExpiry = Date.now() + response.data.expires_in * 1000 - 60000;

  console.log("[FB Auth] Calling signInWithCustomToken...");
  await authenticateFirebase(firebaseToken);
  console.log("[FB Auth] signInWithCustomToken succeeded");
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
