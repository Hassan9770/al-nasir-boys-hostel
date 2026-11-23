# AL NASIR BOYS HOSTEL — MERN Website

Public website, Resident Portal, secure Admin Panel, room/bed booking, rent & mess payment records, mess subscriptions (including external customers), versioned policies with acceptance records, and WhatsApp integration.

**Stack:** React + Vite + Tailwind · Node/Express · MongoDB/Mongoose · JWT in HTTP-only cookies.

## Honest status
- The client builds cleanly and the API starts and enforces auth/CSRF (checked). The full booking, payment and mess flows were **not run against a live MongoDB in the environment where this was generated**, so run through the checklist at the bottom on your machine before launch.
- All prices, rooms, mess plans, contact details and policy texts seeded are **placeholders**. Policy text is a template, **not legal advice**.
- Email (password-reset links) is **not connected**: the link is printed in the server console until you plug a provider into `server/services/notify.js` (`sendEmail`).
- Automatic WhatsApp notifications are **disabled** unless you set the three `WHATSAPP_*` variables. The floating WhatsApp chat button always works.
- Passwords use `bcryptjs` (pure JS) so Windows installs need no build tools.

## 1. Windows setup
Install Node.js 20 LTS and Git. Then, in PowerShell:
```powershell
cd al-nasir-boys-hostel
copy .env.example server\.env
notepad server\.env        # fill MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
cd server; npm install; npm run seed; npm run dev
```
Second PowerShell window:
```powershell
cd al-nasir-boys-hostel\client
npm install
npm run dev
```
Open http://localhost:5173. Log in with the admin email/password from `server\.env` and go to **Admin Dashboard**.
Generate a JWT secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

## 2. MongoDB Atlas
1. Create a free account at mongodb.com/atlas → create a free **M0** cluster.
2. **Database Access** → add a user with a strong password (Read/Write any database).
3. **Network Access** → add your IP (and later your server's IP).
4. **Connect → Drivers** → copy the connection string, replace `<password>`, and add the database name `al-nasir-hostel` before the `?`. Paste into `MONGODB_URI`.

## 3. First things to do as admin
1. **Website Content**: real phone, address, WhatsApp number (digits with country code, e.g. `923001234567`), map embed, hours, payment methods.
2. **Facilities**: enable only what the hostel truly provides.
3. **Rooms** and **Mess Plans**: replace sample data with real prices.
4. **Terms & Policies**: edit every `[bracketed]` item, get it reviewed, publish a new version.
5. **Gallery**: upload real photos (JPG/PNG/WebP, 3 MB max).

## 4. How the main rules work
- **Capacity:** bookings are checked per date range using peak simultaneous occupancy. A pending request does not hold a bed; **approval** re-checks capacity (serialised per room, with a post-write verification to roll back overbooking). One occupied bed never closes a whole room.
- **Statuses:** pending → approved → checked_in → completed; pending → rejected/cancelled. Residents can cancel pending requests directly and *request* cancellation for approved/checked-in stays.
- **Payments:** a ledger entry per resident/service/month with an amount due. Admin records money actually received (Cash, Bank Transfer, …); status paid/partial/unpaid is computed. Receipts exist only for recorded payments. "Generate monthly dues" creates unpaid entries from approved bookings and active subscriptions.
- **Mess:** separate from bookings. External customers sign up (category "Mess Customer Only") and subscribe without a room. "Hostel Resident" subscriptions require an approved booking.
- **Policies:** five versioned documents (terms, rules, mess, payment, privacy). Published versions are locked; publish a new version, optionally forcing re-acceptance. Acceptances (user, time, versions, IP, context) are stored in `termsacceptances`.
- **Security:** bcrypt, JWT (7d) in HTTP-only/SameSite cookie, `X-Requested-With` CSRF guard + locked CORS, Helmet, rate limits, Zod validation, role checks on every admin route, uploads limited to JPG/PNG/WebP ≤ 3 MB with random names, no password hashes in responses. Public registration can only create `resident` accounts; the admin comes only from the seed script.

## 5. Postman testing
1. Create an environment with `base = http://localhost:5000/api`. Enable the cookie jar (Postman keeps cookies automatically).
2. Add header `X-Requested-With: XMLHttpRequest` to every POST/PUT/PATCH/DELETE (required).
3. Suggested order:
   - `POST {{base}}/auth/register` body: `{"name":"Test User","email":"t@example.com","phone":"+923001234567","password":"Test12345","confirmPassword":"Test12345","residentCategory":"Student","acceptTerms":true}`
   - `GET {{base}}/rooms` → copy a room `_id`
   - `POST {{base}}/bookings` `{"roomId":"<id>","checkIn":"2030-01-01","durationMonths":2,"residentCategory":"Student","emergencyName":"Parent","emergencyPhone":"+923001234568","acceptTerms":true}`
   - `GET {{base}}/bookings/mine`
   - Log in as admin (`POST /auth/login`), then `GET /admin/stats`, `GET /admin/bookings`, `PATCH /admin/bookings/<id>/status {"status":"approved"}`, `POST /admin/payments/generate {"billingMonth":"2030-01"}`, `POST /admin/payments`.
   - Negative tests: call `/admin/stats` as the student → 403; book a full room → 409; omit the header on a POST → 403.

## 6. Deployment
- **API (Render/Railway/VPS):** root `server`, build `npm install`, start `npm start`. Set all variables from `.env.example`, `NODE_ENV=production`, `CLIENT_URL=https://your-site`. Uploaded images are stored on local disk — on hosts with ephemeral disks attach a persistent volume or move uploads to cloud storage.
- **Client (Netlify/Vercel/static host):** root `client`, build `npm run build`, output `dist`. Add an SPA fallback (`/* /index.html 200`).
- **Cookies across domains:** best is one domain (e.g. `site.com` + reverse-proxy `/api` and `/uploads` to the API). If the API is on a different domain set `COOKIE_SAMESITE=none` (requires HTTPS), set `VITE_API_URL=https://api.example.com` in the client build, and set `CLIENT_URL` to the exact site origin.
- Run `npm run seed` once against the production database (change the admin password immediately).

## 7. WhatsApp
- Floating chat button + contact links use `https://wa.me/<number>?text=…` from **Website Content → WhatsApp number**.
- Optional notifications to management on new bookings/mess requests/enquiries: create a Meta WhatsApp Business Cloud API app, then set `WHATSAPP_API_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_NOTIFY_TO`. Tokens stay server-side. Business-initiated messages typically require an approved message template with Meta; adapt `server/services/notify.js` if your account requires templates.

## 8. Pre-launch checklist
- [ ] Register a resident, accept terms, submit a booking, approve it as admin, see status in the portal
- [ ] Try to overbook a 1-bed room for overlapping dates (must fail)
- [ ] Generate dues, record a partial payment, print the receipt
- [ ] Subscribe to mess as an external customer (no room) and approve it
- [ ] Publish a new policy version with re-acceptance and confirm the resident is prompted
- [ ] Forgot password flow (needs email provider)
- [ ] Check on a phone-sized screen

## Folder map
`client/src/{pages,components,layouts,context,hooks,services,utils,routes}` · `server/{config,controllers,middleware,models,routes,services,utils,scripts}`
