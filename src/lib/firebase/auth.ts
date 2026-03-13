import { get } from "../api/client";
import { authenticateFirebase, signOutFirebase } from "./config";

interface FirebaseTokenResponse {
  firebase_token: string;
  expires_in: number;
}

let firebaseToken: string | null = null;
let tokenExpiry: number | null = null;

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
