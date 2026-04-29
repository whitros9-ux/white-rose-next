import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDVBJBg-2sHL-xMuyVZbU8mikw_zs2Se5k",
  authDomain: "white-rose-23884.firebaseapp.com",
  projectId: "white-rose-23884",
  storageBucket: "white-rose-23884.firebasestorage.app",
  messagingSenderId: "594056019318",
  appId: "1:594056019318:web:814515a35877504b558e57",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);
