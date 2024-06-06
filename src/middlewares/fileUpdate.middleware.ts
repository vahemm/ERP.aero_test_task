import { NextFunction, Response } from "express";
import WrongAuthenticationTokenException from "../exceptions/WrongAuthenticationTokenException";
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
