import * as express from "express";
import dataSource from "../config/typeorm.config";
import Controller from "../interfaces/controller.interface";

import User from "./user.entity";

class UserController implements Controller {
  public path = "/user";
  public router = express.Router();
  private userRepository = dataSource.getRepository(User);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, this.getAllPosts);
   
  }



  private getAllPosts = async (
    request: express.Request,
    response: express.Response
  ) => {
    const posts = await this.userRepository.find();
    response.send(posts);
  };


}

export default UserController;
