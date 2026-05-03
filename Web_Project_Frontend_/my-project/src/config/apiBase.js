const trimmed = String(import.meta.env.VITE_API_URL ?? "").trim();

// Never fall back to localhost in production — that ships broken bundles (calls user's laptop).
if (import.meta.env.PROD && !trimmed) {
  throw new Error(
    "MovieHub: VITE_API_URL was not set when this site was built. In Vercel → Settings → Environment Variables, add VITE_API_URL for Production (your Railway URL), then Redeploy without cache."
  );
}

export const API_BASE_URL = (trimmed || "http://localhost:3213").replace(
  /\/$/,
  ""
);
