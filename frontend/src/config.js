// Single source of truth for the backend URL.
//  - local:  falls back to http://localhost:3500
//  - online: set VITE_API_URL in your host (e.g. Vercel) to your deployed backend
export const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3500"
).replace(/\/$/, "");
