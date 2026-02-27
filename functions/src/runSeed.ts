process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
process.env.GCLOUD_PROJECT = "athleek-sys";

import {seedCategories} from "./seeds/categories.seed";
import {seedInventory} from "./seeds/inventory.seed";

async function run() {
  await seedCategories();
  await seedInventory();
  process.exit();
}

run();
