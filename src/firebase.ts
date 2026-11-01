import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBirRdJPyr925gPISgD0ODm6BnJr8PoXEc',
  authDomain: 'alg-geo-grinder.firebaseapp.com',
  projectId: 'alg-geo-grinder',
  storageBucket: 'alg-geo-grinder.firebasestorage.app',
  messagingSenderId: '792542759196',
  appId: '1:792542759196:web:29c3c039e136141617d2d9',
  measurementId: 'G-NHRZV3XTB3',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
