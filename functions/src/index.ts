import * as functions from "firebase-functions";
import { app } from "./app";
import cors from "cors";

const corsHandler = cors({ origin: true, credentials: true });

export const api = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => app(req, res));
});