import * as functions from "firebase-functions";
import { app } from "./app";
import cors from "cors";

// Habilita CORS solo para tu frontend
const corsHandler = cors({
  origin: "https://athleek-sys.web.app",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true
});

export const api = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => {
    app(req, res);
  });
});