import fs from "fs";
import util from "util";
import multer from "multer";
import path from "path";
import { RequestWithUserAndFile } from "../interfaces/requestWithUserAndFile.interface";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileUpdateStorage = multer.diskStorage({
  destination: (req: RequestWithUserAndFile, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req: RequestWithUserAndFile, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const fileUpdateMulter = multer({
  storage: fileUpdateStorage,
  fileFilter: (req: RequestWithUserAndFile, file, cb) => {
    let files = fs.readdirSync(path.join(__dirname, "../uploads"));
    if (files.includes(req.oldFile.fileName)) {
      fs.unlinkSync(path.join(__dirname, "../uploads", req.oldFile.fileName));
    }
    cb(null, true);
  },
});

export const upload = multer({ storage });
