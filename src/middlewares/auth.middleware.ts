import { NextFunction, Response } from "express";
import * as jwt from "jsonwebtoken";
import dataSource from "../config/typeorm.config";
import AuthenticationTokenMissingException from "../exceptions/AuthenticationTokenMissingException";
import WrongAuthenticationTokenException from "../exceptions/WrongAuthenticationTokenException";
import DataStoredInToken from "../interfaces/dataStoredInToken";
import User from "../user/user.entity";
import { RequestWithUser } from "../interfaces/requestWithUser.interface";

export async function authMiddleware(
  request: RequestWithUser,
  response: Response,
  next: NextFunction
) {
  const userRepository = dataSource.getRepository(User);

  const authorization = request.headers.authorization.replace("Bearer ", "");

  if (authorization) {
    const secret = process.env.JWT_ACCESS_TOKEN_SECRET as string;
    try {
      const verificationResponse = jwt.verify(
        authorization,
        secret
      ) as DataStoredInToken;

      const id = verificationResponse.id;

      const user = await userRepository.findOne({ where: { id } });
      if (user) {
        request.user = user;

        next();
      } else {
        next(new WrongAuthenticationTokenException());
      }
    } catch (error) {
      next(new WrongAuthenticationTokenException());
    }
  } else {
    next(new AuthenticationTokenMissingException());
  }
}
