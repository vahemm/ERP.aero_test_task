import dataSource from "../config/typeorm.config";
import File from "./file.entity";
import path from "path";
import fs from "fs";

class FileService {
  private fileRepository = dataSource.getRepository(File);

  public async upload(file, user) {
    const newFile = this.fileRepository.create({
      fileName: file.filename,
      extension: path.extname(file.originalname),
      mimeType: file.mimetype,
      fileSize: file.size,
      user,
    });
    const fileInfo = await this.fileRepository.save(newFile);

    return fileInfo;
  }

  public async fileList(user, listSizeParam, pageParam) {
    const listSize = listSizeParam || 10;
    const page = pageParam ? pageParam - 1 : 0;

    const fileList = await this.fileRepository
      .createQueryBuilder()
      .orderBy("uploadDate", "ASC")
      .where("userId = :userId", { userId: user.id })
      .skip(listSize * page)
      .take(listSize)
      .getMany();

    return fileList;
  }
  updateFileByID;

  public async getFileById(user, id) {
    const file = await this.fileRepository
      .createQueryBuilder()
      .orderBy("uploadDate", "ASC")
      .where("id = :id", { id })
      .andWhere("userId = :userId", { userId: user.id })
      .getOne();

    return file;
  }

  public async updateFileById(user, id, file) {
    await this.fileRepository
      .createQueryBuilder()
      .update<File>(File, {
        fileName: file.filename,
        extension: path.extname(file.originalname),
        mimeType: file.mimetype,
        fileSize: file.size,
      })
      .where("id = :id", { id })
      .andWhere("userId = :userId", { userId: user.id })
      .updateEntity(true)
      .execute();

    return await this.getFileById(user, id);
  }

  public async deleteFileByID(user, id) {
    const file = await this.fileRepository
      .createQueryBuilder()
      .orderBy("uploadDate", "ASC")
      .where("id = :id", { id })
      .andWhere("userId = :userId", { userId: user.id })
      .getOne();

    const deleteResult = await this.fileRepository
      .createQueryBuilder()
      .delete()
      .where("id = :id", { id })
      .andWhere("userId = :userId", { userId: user.id })
      .execute();

    if (deleteResult.affected !== 0) {
      try {
        let files = fs.readdirSync(path.join(__dirname, "../uploads"));

        if (files.includes(file.fileName)) {
          fs.unlinkSync(path.join(__dirname, "../uploads", file.fileName));
        }
      } catch (error) {
        console.log({ error });
      }
    }

    return deleteResult;
  }
}

export default FileService;
