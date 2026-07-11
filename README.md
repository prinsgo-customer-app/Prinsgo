# PrinsGo Customer App (React Native / Expo)

Real, fully-wired mobile app — Auth, Ride booking + live tracking, Parcel booking + live tracking, Wallet, Saved Addresses, Support. No dummy/mock data — everything calls your `prinsgo-backend`.

## Setup

```bash
npm install
```

### 1. Point the app at your backend

Open `src/config.js` and set:

```js
export const API_BASE_URL = 'http://<your-ip-or-domain>:5000/api';
export const SOCKET_URL = 'http://<your-ip-or-domain>:5000';
```

- **Testing on your phone via Expo Go**: use your computer's LAN IP (e.g. `http://192.168.1.5:5000`), not `localhost` — your phone can't reach your computer's localhost.
- **Once backend is deployed on Render**: use the Render URL, e.g. `https://prinsgo-backend.onrender.com`.

Also update `SUPPORT_PHONE` and `SUPPORT_EMAIL` in the same file with your real support contact.

### 2. Run it

```bash
npx expo start
```

Scan the QR code with the **Expo Go** app (Android/iOS) — no Android Studio or Xcode needed for development.

## What's implemented

- **Auth**: Phone OTP login/register (matches backend `/api/auth`)
- **Home**: Current location (GPS), 4 service shortcuts (Bike/Auto/Cab/Parcel), pickup/drop card, saved addresses shortcuts, quick actions (Offers, Wallet, Ride/Parcel History, Support)
- **Ride booking**: Real Google Places address search, live fare estimate for all vehicle types, cash/wallet payment choice, booking
- **Ride tracking**: Live status via Socket.IO (`ride_status_update`), start OTP display, driver info + call button, cancel, post-ride star rating
- **Parcel booking**: Same address search flow, parcel type + weight category, sender/receiver contact fields, charge estimate, booking
- **Parcel tracking**: Live status, receiver OTP display, cancel
- **Bookings**: Ride/Parcel history tabs
- **Wallet**: Real balance + transaction history from backend (`/api/wallet/transactions`); "Add Money" shows a clear "coming soon" message since Razorpay isn't wired up yet (Phase 4)
- **Profile**: Edit name/email, referral code, logout
- **Saved Addresses**: Add/remove Home/Work/Other addresses
- **Offers**: Honest empty state (no offers backend exists yet — this is not a fake/dummy list)
- **Support**: Real call / WhatsApp / email links

## Deploying as a Web App (Vercel)

This Expo app can run as a normal website too (via `react-native-web`), no Play Store needed.

**Local test first:**
```bash
npm run web
```
Opens in your browser (usually `localhost:8081`).

**Deploy to Vercel:**
```bash
npm install -g vercel
vercel login
vercel --prod
```
Vercel reads `vercel.json` in this folder, which runs `npm run build:web` (Expo's static web export) and serves the `dist/` folder. No extra configuration needed — run this from inside the `prinsgo-customer-app` folder.

**Note:** GPS location (used for pickup) uses the browser's Geolocation API on web instead of native GPS — the browser will show its own "Allow location access" prompt instead of a native one.

## Known gaps (by design, not oversights)

- **No live map view** — ride/parcel tracking shows a placeholder instead of `react-native-maps`, to avoid needing native map SDK configuration (Google Maps API key wiring in `app.json`, native rebuild) in this pass. Swap in `react-native-maps` + polyline drawing when ready; the pickup/drop lat-lng and live driver location (via socket) are already available in state.
- **No Razorpay top-up yet** — wallet is view-only + backend cash/wallet settlement; online top-up needs Razorpay Checkout SDK integration (Phase 4).
- **Offers/Promo Codes screen is empty** — there's no Offers model/API in the backend yet (only referenced in the original spec, not built). Build that in the admin backend first, then wire this screen to it.
- **No push notifications yet** — FCM token isn't captured/registered from the app; add `expo-notifications` + call `PUT /api/auth/profile` with the token when ready.

## Folder structure

```
App.js
src/
├── config.js              # API_BASE_URL, SOCKET_URL, support contact
├── theme/colors.js
├── context/AuthContext.js # token storage, session, login/logout
├── api/                   # one file per backend resource
├── utils/socket.js        # Socket.IO client singleton
├── navigation/
│   ├── RootNavigator.js   # auth stack vs main app stack
│   ├── MainTabNavigator.js
│   └── BookingsStack.js
├── components/            # PrimaryButton, InputField, ServiceIcon, etc.
└── screens/
    ├── auth/ (Login, Otp)
    ├── home/ (Home)
    ├── ride/ (RideBooking, RideTracking)
    ├── parcel/ (ParcelBooking, ParcelTracking)
    ├── location/ (LocationSearch)
    ├── bookings/ (Bookings - ride/parcel history)
    ├── wallet/ (Wallet)
    ├── profile/ (Profile, SavedAddresses)
    └── more/ (More, Offers, Support)
```
