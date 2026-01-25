process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
process.env.GCLOUD_PROJECT = "athleek-sys";

import { seedCategories } from "./seeds/categories.seed";

seedCategories()
  .then(() => {
    console.log("🌱 Seed completado");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error en seed:", err);
    process.exit(1);
  });
