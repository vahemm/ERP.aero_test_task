import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import App from "./app";
import dataSource from "./config/typeorm.config";
import PostController from "./post/post.controller";
import UserController from "./user/user.controller";
import AuthenticationController from "./auth/auth.controller";

dotenv.config();

(async () => {
  try {
    dataSource.initialize();
  } catch (error) {
    console.log("Error while connecting to the database", error);
    return error;
  }
  const app = new App([
    new PostController(),
    new UserController(),
    new AuthenticationController(),
    // new AuthenticationController(),
    // new AddressController(),
    // new CategoryController(),
  ]);
  app.listen();
})();
