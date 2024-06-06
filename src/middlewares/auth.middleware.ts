import { NextFunction, Response } from "express";
import * as jwt from "jsonwebtoken";
import dataSource from "../config/typeorm.config";
import AuthenticationTokenMissingException from "../exceptions/AuthenticationTokenMissingException";
import WrongAuthenticationTokenException from "../exceptions/WrongAuthenticationTokenException";
import DataStoredInToken from "../interfaces/dataStoredInToken";
import User from "../user/user.entity";
import { RequestWithUser } from "../interfaces/requestWithUser.interface";
import Token from "../token/token.entity";

export async function authMiddleware(
  request: RequestWithUser,
  response: Response,
  next: NextFunction
) {
  const userRepository = dataSource.getRepository(User);
  const tokenRepository = dataSource.getRepository(Token);

  const authorization = request.headers.authorization;

  if (authorization) {
    const secret = process.env.JWT_ACCESS_TOKEN_SECRET as string;
    try {
      const bearerToken = authorization.replace("Bearer ", "");

      const verificationResponse = jwt.verify(
        bearerToken,
        secret
      ) as DataStoredInToken;

      const id = verificationResponse.id;

      const user = await userRepository.findOne({ where: { id } });
      const token = await tokenRepository.findOne({
        where: { accessToken: bearerToken },
      });

      if (!token) {
        next(new WrongAuthenticationTokenException());
      }

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
