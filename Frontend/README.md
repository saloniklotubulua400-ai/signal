# Signal Desk storefront (React + Vite)

The Signal Desk storefront: SMS, email, WhatsApp and verification services, sold through the Express + Supabase server.

## Run it
1. `npm install`
2. Copy `.env.example` to `.env`. Set `VITE_API_URL` to your server address
   (`http://localhost:5000`, or `5001` if you changed the port).
3. Start the server (`npm run dev` in the server folder) in one terminal.
4. In this folder: `npm run dev`, then open http://localhost:5173

The server's `.env` must allow this address: `CORS_ORIGINS=http://localhost:5173`.
Restart the server after changing it.

## First walkthrough
1. Click **Sign up**, create an account, and log in.
2. Make yourself admin in Supabase (SQL Editor):
   `update public.profiles set role = 'admin' where email = 'you@example.com';`
   Log out and log in again. An **Admin** button appears in the top bar.
3. Admin, then Products, then **Add sample products** (SMS, email, WhatsApp, verification and voice examples).
4. Shop: add items, open the cart, **Place order**.
5. Admin, then Orders, then **Mark as paid** (manual payment mode).
6. Account, then Keys and services: your keys are there. Products set to "I deliver it by hand"
   appear under Admin, then Deliveries, where you type the login details to send.

## Change the brand
Edit `src/config.js` (store name, support email). Logo files are in `public/`
(`logo.png`, `logo-light.png` for dark backgrounds, `logo-mark.png`, favicons). Colors and fonts are the variables at
the top of `src/styles.css` (navy and cyan come from the logo). Category colors and icons are in `src/lib/categories.js`.

## Build for production
`npm run build` creates the `dist` folder. Upload it to any static host and set
`VITE_API_URL` to your live server before building.

## Good to know
- Product pictures are generated from the category (color and icon). Real image uploads need a
  small server and database update, which is a good next step.
- The login session lasts about an hour. After that you are asked to log in again.
- Hidden products can be hidden from the admin screen but not shown again yet.
- Paystack: set the callback URL in the server `.env` to `http://localhost:5173/payment/callback`
  (or your live address). Customers return there and the order page confirms payment.
