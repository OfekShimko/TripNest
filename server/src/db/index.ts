import { createDatabase } from "./database_init";

export * from "./dal";

createDatabase()
  .then(() => {
    console.log(`Database '${process.env.DB_NAME}' is ready.`);
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });
