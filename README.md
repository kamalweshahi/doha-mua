# DOHA MUA

A full-stack makeup education and bridal availability platform built with React, TypeScript, Vite, Node.js, Express, Sequelize, MySQL, and Docker Compose.

## What is included

- Student and administrator JWT authentication, with optional Google sign-in.
- Published makeup courses, instructor details, ordered lessons, image uploads, and secure lesson-video handoff.
- Student course library with server-authoritative regular/sale pricing and explicit demo success, failure, and cancellation results.
- Public, read-only bridal availability calendar with no account requirement and no customer booking or bridal payment flow.
- Protected admin bridal slot management, legacy appointment history, searchable student history, website content, course/lesson management, purchases and notifications.
- Replaceable bilingual email architecture, prepared but disabled by default.
- Seeded accounts, courses, lessons, paid purchase, and January–March 2027 availability.

## Start with Docker

Create `.env` in the project root (or use the Compose defaults for local development):

```env
MAKEUP_JWT_KEY=replace-with-a-long-random-secret
MAKEUP_PASSWORD_KEY=replace-with-a-different-long-random-secret
MAKEUP_GOOGLE_CLIENT_ID=
WHATSAPP_NUMBER=972556800545
VITE_WHATSAPP_NUMBER=972556800545
ADMIN_EMAIL=Kamalweshahi15@gmail.com
EMAIL_ENABLED=false
EMAIL_PROVIDER=
EMAIL_FROM=
VDOCIPHER_API_SECRET=
```

Then run:

```bash
docker compose up --build
```

Open the frontend at `http://localhost:6123` and the API at `http://localhost:3000/api`. The health endpoint is `http://localhost:3000/health`.

To reset the development database and uploads:

```bash
docker compose down -v
docker compose up --build
```

## Local development

Run MySQL through Compose, then in separate terminals:

```bash
cd backend && npm ci && npm run dev
cd frontend && npm ci && npm run dev
```

Useful commands:

```bash
cd backend && npm run build && npm test -- --runInBand
cd frontend && npm run build
docker compose config
```

## Seed accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@doha-mua.local` | `Admin1234` |
| Student | `student@doha-mua.local` | `User1234` |
| Student | `maya@doha-mua.local` | `Student1234` |

## Bridal availability schedule and email

The seed is idempotent and creates Monday–Saturday availability from January 4 through March 31, 2027. Sundays are never generated. Every open date uses exactly `08:00–11:00`, `11:00–14:00`, and `14:00–17:00`. Anyone can view the public calendar without an account. The public response includes only date, time range, and availability status. Only an administrator can block or reopen a slot. Existing legacy appointment records remain unavailable and remain visible only in protected administration and student history views.

Email templates and a replaceable provider interface remain implemented for legacy appointment updates and course purchase events. Email is disabled by default. A console adapter is available for development with `EMAIL_ENABLED=true` and `EMAIL_PROVIDER=console`; SMTP and Resend variables are reserved for future adapters.

## Payments and protected video

The checkout endpoint records a purchase with a `paypal` or `payplus` provider selection and an explicit demo result. Only `paid` purchases grant course/video access. Failed and cancelled results remain visible in payment history without granting access. Course price is always selected by the backend: a valid positive sale price below the regular price is used; client-supplied amounts are never accepted. Before accepting live payments, replace the demo result with provider-side order/session creation and verified webhooks.

There is no bridal checkout or bridal deposit endpoint. Course checkout remains unchanged and separate from the bridal availability calendar. Email delivery remains non-blocking and disabled unless configured.

Website Content in Admin edits only the bilingual hero, About Doha, bridal description, studio address message, WhatsApp number, and contact email. Public rendering falls back to built-in defaults if the record cannot load. The default address intentionally says that the full studio address is sent after confirmation.

Private video identifiers and playback references are never included in public or student course responses. Lessons store `videoProvider`, `videoId`, `videoStatus`, and an optional legacy playback reference. The existing protected lesson endpoint requires authentication and returns a fresh, 300-second VdoCipher OTP only to an administrator or a student with a paid course purchase. The OTP request includes a moving watermark with the authenticated student's name, email, and user ID. Temporary OTP and playback information are never stored.

To configure protected VdoCipher playback:

1. Set `VDOCIPHER_API_SECRET` only in the backend runtime environment. Leave it empty in tracked example files and never add it to a `VITE_` variable.
2. In Admin, open the course editor and locate the lesson.
3. Select `VdoCipher` as the video provider.
4. Paste that lesson's VdoCipher Video ID and set its video status to `Ready` only after VdoCipher finishes processing it.
5. Save the course. No permanent playback URL is required for VdoCipher lessons.

The browser embeds `https://player.vdocipher.com/v2/` inside the course page with `strict-origin-when-cross-origin` referrer behavior for VdoCipher domain verification. In the VdoCipher dashboard, allow the production Doha site domain before live playback. Localhost may also need to be allowed while testing. See the [VdoCipher OTP documentation](https://www.vdocipher.com/docs/server/playbackauth/otp/) and [annotation documentation](https://www.vdocipher.com/docs/server/playbackauth/anno/).

Google OAuth is disabled until `MAKEUP_GOOGLE_CLIENT_ID` is set. The backend validates the Google ID token audience and verified email before creating a Student account; it never grants Admin access through Google.

## Language and WhatsApp verification

The selected English or Arabic language is stored under `doha-mua-language` and remains active across refreshes, public routes, student pages, and admin pages. Arabic sets `<html lang="ar" dir="rtl">`; English restores `lang="en" dir="ltr"`. The calendar localizes weekday and month names while dates, prices, email addresses, and time slots remain readable left-to-right.

The database-backed Website Content record is the primary source for visible `wa.me` links, with `VITE_WHATSAPP_NUMBER=972556800545` as the safe frontend fallback. The shared WhatsApp link URL-encodes an English or Arabic bridal enquiry and appears on public pages and in the footer; the public floating link is intentionally hidden in Admin.

Manual checks: switch to Arabic on Home, Courses, Login, Register, Bridal Availability, all policy pages, My Courses, course details, and Admin; refresh and confirm Arabic persists; verify RTL and no horizontal overflow at desktop and mobile widths; confirm the bridal calendar shows Arabic weekdays/months; and inspect WhatsApp links for `972556800545` and the language-appropriate encoded message.
