import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.GCLOUD_PROJECT || "athleek-sys",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'entaltek-manicura.firebasestorage.app',
  });
}

export const db = admin.firestore();

// SOLO LOG, NO settings()
if (process.env.FIRESTORE_EMULATOR_HOST) {
  console.log("🧪 Firestore EMULATOR:", process.env.FIRESTORE_EMULATOR_HOST);
}
