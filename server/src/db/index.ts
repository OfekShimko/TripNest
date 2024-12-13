import { config } from "../../config";
import { createDatabase } from "./database_init";

export * from "./dal";

createDatabase()
  .then(() => {
    console.log(`Database '${config.dbName}' is ready.`);
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });
