// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyAVGPT6CKyiS_HmeGg_i0K7GH8qzSGpCWc',
  authDomain: 'gamelog-40e10.firebaseapp.com',
  projectId: 'gamelog-40e10',
  storageBucket: 'gamelog-40e10.firebasestorage.app',
  messagingSenderId: '799231800910',
  appId: '1:799231800910:web:3cf45b5a0d3ef6c763b51f',
  measurementId: 'G-F1K0LBQR4X',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
