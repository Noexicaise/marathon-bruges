import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCkD0MSqBoknqxSaiy2BP_qFuMl-VRLS04",
  authDomain: "marathon-app-8df07.firebaseapp.com",
  projectId: "marathon-app-8df07",
  storageBucket: "marathon-app-8df07.firebasestorage.app",
  messagingSenderId: "469631016784",
  appId: "1:469631016784:web:c1f61ae1dd063edf715655"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);