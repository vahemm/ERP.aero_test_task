import { Request } from "express";
import User from "../user/user.entity";
import File from "../file/file.entity";


export interface RequestWithUserAndFile extends Request {
  user: User;
  oldFile: File;
}

