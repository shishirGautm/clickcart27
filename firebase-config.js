// ======================================================
// CLICKCART FIREBASE CONFIG
// ======================================================

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getDatabase
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";


// ======================================================
// FIREBASE CONFIGURATION
// ======================================================

const firebaseConfig = {

  apiKey:
    "AIzaSyCeXcWzZemok7U4EV7RHM-ONNU_3CcDDHw",

  authDomain:
    "ecommerce-e705c.firebaseapp.com",

  databaseURL:
    "https://ecommerce-e705c-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId:
    "ecommerce-e705c",

  storageBucket:
    "ecommerce-e705c.firebasestorage.app",

  messagingSenderId:
    "698400218033",

  appId:
    "1:698400218033:web:b662f7900dbe1e33873b90",

  measurementId:
    "G-FWQGJYH7Q7"
};


// ======================================================
// INITIALIZE FIREBASE
// ======================================================

const app = initializeApp(firebaseConfig);


// ======================================================
// FIREBASE AUTHENTICATION
// ======================================================

export const auth = getAuth(app);


// ======================================================
// FIREBASE REALTIME DATABASE
// ======================================================

export const db = getDatabase(app);


// ======================================================
// EXPORT APP
// ======================================================

export default app;