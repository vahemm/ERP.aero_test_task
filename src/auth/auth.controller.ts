import * as express from "express";
import Controller from "../interfaces/controller.interface";
import { SignInUserDto, CreateUserDto } from "./dtos/user.dto";
import AuthService from "./auth.service";
import validationMiddleware from "../middlewares/validation.middleware";
import { RefreshTokenDto } from "./dtos/refreshToken.dto";
import { RequestWithUser } from "../interfaces/requestWithUser.interface";
import { authMiddleware } from "../middlewares/auth.middleware";
import User from "../user/user.entity";
import { LogoutDto } from "./dtos/logout.dto";

class AuthenticationController implements Controller {
  public path = "/auth";
  public router = express.Router();
  private authenticationService = new AuthService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/signup`,
      validationMiddleware(CreateUserDto),
      this.signUp
    );
    this.router.post(
      `${this.path}/signin`,
      validationMiddleware(SignInUserDto),
      this.signIn
    );
    this.router.post(
      `${this.path}/signin/new_token`,
      validationMiddleware(RefreshTokenDto),
      this.updateToken
    );

    this.router.get(`${this.path}/info`, authMiddleware, this.info);

    this.router.post(
      `${this.path}/logout`,
      authMiddleware,
      validationMiddleware(LogoutDto),
      this.logout
    );
  }

  private signUp = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const userData: CreateUserDto = request.body;
    try {
      const { accessToken, refreshToken, user } =
        await this.authenticationService.signUp(userData);
      response.send({ user, accessToken, refreshToken });
    } catch (error) {
      next(error);
    }
  };

  private signIn = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const userData: SignInUserDto = request.body;
    try {
      const { accessToken, refreshToken, user } =
        await this.authenticationService.signIn(userData);
      response.send({ user, accessToken, refreshToken });
    } catch (error) {
      next(error);
    }
  };

  private updateToken = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const data: RefreshTokenDto = request.body;
    try {
      const { accessToken, refreshToken, user } =
        await this.authenticationService.updateToken(data);
      response.send({ user, accessToken, refreshToken });
    } catch (error) {
      next(error);
    }
  };

  private info = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const user: User = request.user;
    delete (user as { password?: string }).password;

    try {
      response.send({ user });
    } catch (error) {
      next(error);
    }
  };

  private logout = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const user: User = request.user;
    const deviceId: string = request.body.deviceId;
    try {
      await this.authenticationService.logout(user, deviceId);
      response.status(200).json({ message: "You are logged out!" });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthenticationController;
