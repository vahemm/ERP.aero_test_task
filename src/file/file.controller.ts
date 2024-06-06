import * as express from "express";
import Controller from "../interfaces/controller.interface";
import AuthService from "./file.service";
import validationMiddleware from "../middlewares/validation.middleware";
import { RequestWithUser } from "../interfaces/requestWithUser.interface";
import { authMiddleware } from "../middlewares/auth.middleware";
import User from "../user/user.entity";
import FileService from "./file.service";
import { fileUpdateMulter, upload } from "../middlewares/multer.middlware";
import WrongFileIdException from "../exceptions/WrongFileIdException";
import path from "path";
import multer from "multer";
import { RequestWithUserAndFile } from "../interfaces/requestWithUserAndFile.interface";
import { fileUpdateMiddleware } from "../middlewares/fileUpdate.middleware";

class FileController implements Controller {
  public path = "/file";
  public router = express.Router();
  private fileService = new FileService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      authMiddleware,
      upload.single("file"),
      this.upload
    );

    this.router.get(`${this.path}/list`, authMiddleware, this.fileList);

    this.router.get(
      `${this.path}/download/:id`,
      authMiddleware,
      this.fileDownload
    );

    this.router.delete(
      `${this.path}/delete/:id`,
      authMiddleware,
      this.fileDelete
    );

    this.router.put(
      `${this.path}/update/:id`,
      authMiddleware,
      fileUpdateMiddleware,
      fileUpdateMulter.single("file"),
      this.fileUpdate
    );

    this.router.get(`${this.path}/:id`, authMiddleware, this.getFileInfo);
  }

  private upload = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const { file, user } = request;

      const fileInfo = await this.fileService.upload(file, user);

      response.send({ fileInfo });
    } catch (error) {
      next(error);
    }
  };

  private fileList = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const { user } = request;
      const listSize = +request.query.list_size;
      const page = +request.query.page;

      const filesList = await this.fileService.fileList(user, listSize, page);

      response.send({ filesList });
    } catch (error) {
      next(error);
    }
  };

  private getFileInfo = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const { user } = request;

      const id = +request.params.id;

      if (!id) {
        throw new WrongFileIdException();
      }

      const file = await this.fileService.getFileById(user, id);

      if (!file) {
        throw new WrongFileIdException();
      }

      response.send(file);
    } catch (error) {
      next(error);
    }
  };

  private fileDownload = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const { user } = request;

      const id = +request.params.id;

      if (!id) {
        throw new WrongFileIdException();
      }

      const file = await this.fileService.getFileById(user, id);

      if (!file) {
        throw new WrongFileIdException();
      }

      const filePath = path.join(__dirname, "../uploads", file.fileName);
      response.download(filePath);
    } catch (error) {
      next(error);
    }
  };

  private fileDelete = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const { user } = request;

      const id = +request.params.id;

      if (!id) {
        throw new WrongFileIdException();
      }

      const deleteResult = await this.fileService.deleteFileByID(user, id);

      if (deleteResult.affected === 0) {
        throw new WrongFileIdException();
      }

      return response.json({
        success: 1,
        message: "file deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  private fileUpdate = async (
    request: RequestWithUserAndFile,
    response: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const { user } = request;

      const id = +request.params.id;

      const file = await this.fileService.updateFileById(user, id, request.file);

      response.send(file);
    } catch (error) {
      next(error);
    }
  };
}

export default FileController;
