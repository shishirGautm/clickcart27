// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCeXcWzZemok7U4EV7RHM-ONNU_3CcDDHw",
  authDomain: "ecommerce-e705c.firebaseapp.com",
  databaseURL: "https://ecommerce-e705c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ecommerce-e705c",
  storageBucket: "ecommerce-e705c.firebasestorage.app",
  messagingSenderId: "698400218033",
  appId: "1:698400218033:web:b662f7900dbe1e33873b90",
  measurementId: "G-FWQGJYH7Q7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);