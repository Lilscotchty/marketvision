
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, GoogleAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDLfpHD6tKlxekkYLH6IFRkZxmp2pwhmyM",
  authDomain: "marketvision-ai-26nvv.firebaseapp.com",
  projectId: "marketvision-ai-26nvv",
  storageBucket: "marketvision-ai-26nvv.appspot.com",
  messagingSenderId: "988146260477",
  appId: "1:988146260477:web:df3078ad6c25421825e194"
};


let app: FirebaseApp;

// Initialize Firebase
// To avoid re-initializing on hot reloads, check if an app is already initialized.
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
