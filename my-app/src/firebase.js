import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {

  apiKey: "AIzaSyCzx8ckf-Rm8Asv7Rb4gtgzOI3ksB0UITU",

  authDomain: "voltlab-website.firebaseapp.com",

  projectId: "voltlab-website",

  storageBucket: "voltlab-website.firebasestorage.app",

  messagingSenderId: "903575358029",

  appId: "1:903575358029:web:e4100c1f8528a4780fea04"

};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();