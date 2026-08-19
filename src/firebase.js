import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore, collection, doc, onSnapshot,
  setDoc, deleteDoc,
} from "firebase/firestore";

/*
  ЗАПОВНІТЬ ЦІ ЗНАЧЕННЯ своїми даними з Firebase Console
  (Project settings → General → Your apps → SDK setup and configuration).
  Це не секретні ключі "від бази" — вони можуть бути видимі в коді сайту,
  доступ регулюється правилами безпеки Firestore (Firestore Rules), не ними.
*/
const firebaseConfig = {
  apiKey: "AIzaSyCVJBLrjYiKY3gGpKpwct-okSeRbOUKUJw",
  authDomain: "garage17-8a072.firebaseapp.com",
  projectId: "garage17-8a072",
  storageBucket: "garage17-8a072.firebasestorage.app",
  messagingSenderId: "1072868720258",
  appId: "1:1072868720258:web:248614cc8a65fbf6467e9b",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Анонімний вхід — обидва телефони отримують доступ без пароля,
// доступ до бази обмежують правила Firestore (auth != null).
export function ensureSignedIn(cb) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      cb();
    } else {
      signInAnonymously(auth).catch((e) => console.error("auth error", e));
    }
  });
}

// Підписка в реальному часі на колекцію (orders / expenses)
export function watchCollection(name, onData) {
  return onSnapshot(collection(db, name), (snap) => {
    onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (err) => console.error(`watch ${name} failed`, err));
}

export async function saveDoc(collectionName, docId, data) {
  try {
    await setDoc(doc(db, collectionName, docId), data);
    return true;
  } catch (e) {
    console.error("saveDoc failed", collectionName, docId, e);
    return false;
  }
}

export async function removeDoc(collectionName, docId) {
  try {
    await deleteDoc(doc(db, collectionName, docId));
    return true;
  } catch (e) {
    console.error("removeDoc failed", collectionName, docId, e);
    return false;
  }
}

// Налаштування (розподіл прибутку) — один спільний документ
export function watchSettings(onData) {
  return onSnapshot(doc(db, "settings", "split"), (snap) => {
    onData(snap.exists() ? snap.data() : { mechanic: 50, partnerA: 25, partnerB: 25 });
  }, (err) => console.error("watch settings failed", err));
}
export async function saveSettings(data) {
  try {
    await setDoc(doc(db, "settings", "split"), data);
    return true;
  } catch (e) {
    console.error("saveSettings failed", e);
    return false;
  }
}

// Коментарі до клієнтів — один спільний документ { [sanitizedKey]: text }
export function watchClientNotes(onData) {
  return onSnapshot(doc(db, "settings", "clientNotes"), (snap) => {
    onData(snap.exists() ? snap.data() : {});
  }, (err) => console.error("watch clientNotes failed", err));
}
export async function saveClientNotes(data) {
  try {
    await setDoc(doc(db, "settings", "clientNotes"), data);
    return true;
  } catch (e) {
    console.error("saveClientNotes failed", e);
    return false;
  }
}
