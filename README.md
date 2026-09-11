# ClickCart Full E-commerce + Admin Dashboard

## Main storefront
- Modern responsive UI
- Home, categories, shop, search, filters
- Product details and quick view
- Cart and wishlist
- Firebase Email/Password + Google authentication
- Password reset
- Firebase Realtime Database
- Checkout and order creation
- COD, eSewa, Khalti, Bank Transfer and Card payment UI
- Profile, orders, notifications/help placeholders
- Mobile responsive layout

## Admin Dashboard
Open `admin.html` after logging in with an account whose Realtime Database user record has:

`role: "admin"`

Admin features:
- Dashboard statistics
- Product add/edit/delete
- Order list and status updates
- Customer list
- Sales/order analytics
- Admin-only access check

## Firebase setup
1. Create a Firebase project and Web App.
2. Enable Authentication -> Email/Password and Google.
3. Create Realtime Database.
4. Copy your Firebase web config into `firebase-config.js`.
5. Apply `firebase-rules.json` in Realtime Database Rules.
6. Create your user account in ClickCart.
7. In Realtime Database create `users/YOUR_UID/role` with value `admin`.
8. Open `admin.html`.

Example:
```
users
  YOUR_UID
    name: Admin
    email: your@email.com
    role: admin
```

## Run locally
Use VS Code Live Server or another local/static HTTP server. Do not open the HTML files directly with `file://` because ES modules need an HTTP server.

## Payment security
The payment choices are UI flows. Real eSewa/Khalti/card payments require official merchant integration and secure server-side verification. Never place private payment secrets in frontend JavaScript.
