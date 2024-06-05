import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import dataSource from "../config/typeorm.config";

import UserWithThatCredentialsAlreadyExistsException from "../exceptions/UserWithThatCredentialsAlreadyExistsException";
import DataStoredInToken from "../interfaces/dataStoredInToken";
import TokenData from "../interfaces/tokenData.interface";
import User from "../user/user.entity";
import TokenService from "../token/token.service";
import Token from "../token/token.entity";
import { isEmail, isPhoneNumber } from "class-validator";
import { CreateUserDto, SignInUserDto } from "./dtos/user.dto";
import WrongCredentialsException from "../exceptions/WrongCredentialsException";
import { RefreshTokenDto } from "./dtos/refreshToken.dto";
import WrongRefreshTokenException from "../exceptions/WrongRefreshTokenException";
import WrongDeviceIdException from "../exceptions/WrongDeviceIdException";

class AuthService {
  private userRepository = dataSource.getRepository(User);
  private tokenRepository = dataSource.getRepository(Token);
  private tokenService = new TokenService();

  public async signUp(userData: CreateUserDto) {
    const email = isEmail(userData.id) ? userData.id : undefined;
    const phone = isPhoneNumber(userData.id) ? userData.id : undefined;

    const isUserExists = await this.userRepository.findOne({
      where: [{ email: userData.id }, { phone: userData.id }],
    });

    if (isUserExists) {
      throw new UserWithThatCredentialsAlreadyExistsException(userData.id);
    }

    delete (userData as { id?: string }).id;

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = this.userRepository.create({
      ...userData,
      phone,
      email,
      password: hashedPassword,
    });
    await this.userRepository.save(user);
    delete (user as { password?: string }).password;

    const tokenData = await this.tokenService.createToken(
      user,
      userData.deviceId
    );

    return {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      user,
    };
  }

  public async signIn(signInData: SignInUserDto) {
    const email = isEmail(signInData.id) ? signInData.id : undefined;
    const phone = isPhoneNumber(signInData.id) ? signInData.id : undefined;

    const user = await this.userRepository.findOne({
      where: [{ email: signInData.id }, { phone: signInData.id }],
    });

    if (!user) {
      throw new WrongCredentialsException();
    }

    const match = await bcrypt.compare(signInData.password, user.password);

    if (!match) {
      throw new WrongCredentialsException();
    }

    delete (user as { password?: string }).password;

    const tokenData = await this.tokenService.createToken(
      user,
      signInData.deviceId
    );

    return {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      user,
    };
  }

  public async updateToken(data: RefreshTokenDto) {
    const refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET as string;

    const decoded = jwt.verify(
      data.refreshToken,
      refreshTokenSecret
    ) as DataStoredInToken;

    const user = await this.userRepository.findOne({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new WrongRefreshTokenException();
    }

    const oldToken = await this.tokenService.findToken(user, data.refreshToken);

    if (!oldToken) {
      throw new WrongRefreshTokenException();
    }

    const tokenData = await this.tokenService.createToken(
      user,
      oldToken.deviceId
    );
    delete (user as { password?: string }).password;

    return {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      user,
    };
  }

  public async logout(user: User, deviceId: string) {
    const oldToken = await this.tokenService.findTokenByDeviceId(
      user,
      deviceId
    );

    if (!oldToken) {
      throw new WrongDeviceIdException();
    }

    await this.tokenService.deleteToken(user, oldToken.deviceId);
  }
}

export default AuthService;
