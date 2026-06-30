# 🛞 Pump Me (Vulcanizer Finder)

> *"For we are God's handiwork, created in Christ Jesus to do good works, God prepared in advance for us to do." - Ephesians 2:10*

**Pump Me** is an open-source, beautifully designed web application built to help drivers quickly locate nearby roadside vulcanizers during tire emergencies. 

It was built to prove a simple point: **Some of the most meaningful software isn't measured by revenue, but by the people it helps.**

---

## ✨ Features
- **Instant Location Detection:** One-click GPS location access to find help fast.
- **Interactive Map:** A sleek, dark-mode optimized Mapbox interface.
- **Routing & Directions:** Get exact distance, estimated walking/driving time, and live routing to the nearest vulcanizer.
- **One-Tap Calling:** Instantly call the vulcanizer directly from the app.
- **No Sign-Up Required:** Built for emergencies. No accounts, no friction, no hassle.

## 🛠 Tech Stack
This project is a modern full-stack application split into two parts:

### Frontend
- **React 18** (Vite)
- **TypeScript**
- **Tailwind CSS** (for styling and animations)
- **Mapbox GL JS** (via `react-map-gl` for the interactive map)
- **Lucide React** (icons)
- **Vaul** (for sleek mobile bottom-sheet drawers)

### Backend
- **Node.js & Express**
- **TypeScript**
- **Supabase** (PostgreSQL)
- **PostGIS** (for `st_dwithin` geospatial radius queries)

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v20+)
- A Supabase Project (with PostGIS enabled)
- A Mapbox API Key

### 1. Database Setup (Supabase)
Create a table named `vulcanizers` with columns for `id`, `business_name`, `phone`, `latitude`, `longitude`. Then create the following PostGIS RPC function to handle radius searches:

```sql
create or replace function find_nearby_vulcanizers(user_lat float, user_lng float, radius_km float)
returns setof vulcanizers as $$
begin
  return query
  select *
  from vulcanizers
  where st_dwithin(
    st_setsrid(st_makepoint(longitude, latitude), 4326)::geography,
    st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography,
    radius_km * 1000
  );
end;
$$ language plpgsql;
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
FRONTEND_URL=http://localhost:5173
```
Run the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env.local` file in the `frontend` directory:
```env
VITE_MAPBOX_TOKEN=your_mapbox_public_token
VITE_API_URL=http://localhost:3001
```
Run the frontend:
```bash
npm run dev
```

---

## 📜 License
This project is completely free to use and open-source. For all those who use this solution, for those who will and for those who will not use this project, God bless you still. 
