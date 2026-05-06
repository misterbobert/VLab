import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db, googleProvider } from "../firebase";

function normalizeUsername(username) {
  return String(username ?? "")
    .trim()
    .toLowerCase();
}

function usernameToEmail(username) {
  const clean = normalizeUsername(username);
  return `${clean}@voltlab.local`;
}

export function validateUsername(username) {
  const clean = normalizeUsername(username);

  if (clean.length < 3) {
    throw new Error("Username-ul trebuie să aibă cel puțin 3 caractere.");
  }

  if (clean.length > 24) {
    throw new Error("Username-ul trebuie să aibă maximum 24 de caractere.");
  }

  if (!/^[a-z0-9_]+$/.test(clean)) {
    throw new Error(
      "Username-ul poate conține doar litere mici, cifre și underscore."
    );
  }

  return clean;
}

export function validatePassword(password) {
  const text = String(password ?? "");

  if (text.length < 6) {
    throw new Error("Parola trebuie să aibă cel puțin 6 caractere.");
  }

  return text;
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
  return auth.currentUser;
}

export async function registerWithUsername(username, password) {
  const cleanUsername = validateUsername(username);
  const cleanPassword = validatePassword(password);

  const usernameRef = doc(db, "usernames", cleanUsername);
  const usernameSnap = await getDoc(usernameRef);

  if (usernameSnap.exists()) {
    throw new Error("Acest username este deja folosit.");
  }

  const email = usernameToEmail(cleanUsername);

  const result = await createUserWithEmailAndPassword(
    auth,
    email,
    cleanPassword
  );

  const uid = result.user.uid;

  await setDoc(doc(db, "users", uid), {
    username: cleanUsername,
    provider: "username",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await setDoc(usernameRef, {
    uid,
    createdAt: serverTimestamp(),
  });

  return result.user;
}

export async function loginWithUsername(username, password) {
  const cleanUsername = validateUsername(username);
  const cleanPassword = validatePassword(password);

  const email = usernameToEmail(cleanUsername);

  const result = await signInWithEmailAndPassword(auth, email, cleanPassword);

  return result.user;
}

export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      username: null,
      provider: "google",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(
      userRef,
      {
        provider: "google",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  return user;
}

export async function logout() {
  await signOut(auth);
}

export async function getMyProfile() {
  const user = auth.currentUser;

  if (!user) return null;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    uid: user.uid,
    email: user.email,
    ...snap.data(),
  };
}   