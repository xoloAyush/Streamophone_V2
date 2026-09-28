// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyADgWJx4BfDSK55CjwNUhTH2mz3QtpYavs",
  authDomain: "streamophone-3c634.firebaseapp.com",
  projectId: "streamophone-3c634",
  storageBucket: "streamophone-3c634.firebasestorage.app",
  messagingSenderId: "382357872009",
  appId: "1:382357872009:web:53c33863ae92aa1460d558",
  measurementId: "G-9REMQHE5BV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore(app);

// Get a list of cities from your database
async function getCities(db) {
  const citiesCol = collection(db, 'cities');
  const citySnapshot = await getDocs(citiesCol);
  const cityList = citySnapshot.docs.map(doc => doc.data());
  return cityList;
}