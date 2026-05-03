const raw = import.meta.env.VITE_API_URL ?? "";

export const API_BASE_URL = String(raw || "http://localhost:3213").replace(
  /\/$/,
  ""
);
