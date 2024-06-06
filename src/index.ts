import dotenv from "dotenv";
import App from "./app";
import dataSource from "./config/typeorm.config";
import AuthController from "./auth/auth.controller";
import FileController from "./file/file.controller";

dotenv.config();

(async () => {
  try {
    dataSource.initialize();
  } catch (error) {
    console.log("Error while connecting to the database", error);
    return error;
  }
  const app = new App([
    new AuthController(),
    new FileController(),
  ]);
  app.listen();
})();
