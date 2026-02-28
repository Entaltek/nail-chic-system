import * as functions from "firebase-functions";
import { app } from "./app";
import cors from "cors";

// Habilita CORS para producción y localhost
const allowedOrigins = [
  "https://athleek-sys.web.app",
  "http://localhost:8080"
];

const corsHandler = cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Permitir
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true
});

export const api = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => {
    app(req, res);
  });
});