import { NextFunction, Response } from "express";
import * as jwt from "jsonwebtoken";
import dataSource from "../config/typeorm.config";
import AuthenticationTokenMissingException from "../exceptions/AuthenticationTokenMissingException";
import WrongAuthenticationTokenException from "../exceptions/WrongAuthenticationTokenException";
import DataStoredInToken from "../interfaces/dataStoredInToken";
import User from "../user/user.entity";
import File from "../file/file.entity";
import { RequestWithUserAndFile } from "../interfaces/requestWithUserAndFile.interface";
import FileService from "../file/file.service";
import WrongFileIdException from "../exceptions/WrongFileIdException";

export async function fileUpdateMiddleware(
  request: RequestWithUserAndFile,
  response: Response,
  next: NextFunction
) {
  const fileService = new FileService();

  try {
    const id = +request.params.id;

    if (!id) {
      throw new WrongFileIdException();
    }

    request.oldFile = await fileService.getFileById(request.user, id);

    next();
  } catch (error) {
    next(new WrongAuthenticationTokenException());
  }
}
