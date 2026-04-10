# Health Hub CRM

Mobile-first CRM frontend built with React + Vite.

## Environment Variables

Create a local `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Set backend base URL:

```env
VITE_API_BASE_URL=https://medicalcrm-api.onrender.com
```

The app uses this variable for leads APIs such as:
- `/api/leads`
- `/api/leads/:id`

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy on Vercel

1. Push repository to GitHub.
2. In Vercel, click **Add New** -> **Project**.
3. Import this repository.
4. Vercel auto-detects Vite settings.
5. In **Project Settings** -> **Environment Variables**, add:
   - `VITE_API_BASE_URL=https://medicalcrm-api.onrender.com`
6. Deploy.

### Vercel Build Settings (if prompted)

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
