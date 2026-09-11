# ClickCart — HTML + CSS + JavaScript + Firebase

This is a vanilla JavaScript conversion of the supplied ClickCart React/Figma design.

## Included
- `index.html` — single-page entry point
- `style.css` — responsive styling
- `app.js` — routing, product UI, cart, wishlist, authentication and orders
- `firebase-config.js` — Firebase Web SDK configuration
- `firestore.rules` — starter Firestore security rules

## Firebase setup
1. Create a project in Firebase Console.
2. Add a Web App.
3. Copy the Firebase web configuration into `firebase-config.js`.
4. Enable **Authentication → Email/Password**.
5. Create a **Firestore Database**.
6. Deploy `firestore.rules`.
7. Serve the folder with a local web server (ES modules do not work reliably from `file://`).

Example:
```bash
python -m http.server 5500
```
Then open `http://localhost:5500`.

## Firestore structure
- `users/{uid}/private/cart`
- `users/{uid}/private/wishlist`
- `orders/{orderId}`
- `products/{productId}`

The Admin page includes a button to sync the demo products into Firestore.

## Important
The eSewa/Khalti options in this conversion are UI/payment-method fields only. A real payment gateway needs its official merchant credentials, server-side verification and callback handling. Do not put secret payment keys in frontend JavaScript.

## Production
Before publishing:
- lock down admin access using Firebase custom claims or a dedicated admin collection
- use Firebase App Check
- tighten Firestore rules
- validate order prices server-side/with Cloud Functions
- move privileged operations out of the browser
