import * as jwt from "jsonwebtoken";
import dataSource from "../config/typeorm.config";
import DataStoredInToken from "../interfaces/dataStoredInToken";
import TokenData from "../interfaces/tokenData.interface";
import User from "../user/user.entity";
import Token from "./token.entity";

class TokenService {
  private userRepository = dataSource.getRepository(User);
  private tokenRepository = dataSource.getRepository(Token);

  public async createToken(user: User, deviceId: string): Promise<TokenData> {
    const expiresIn = 60 * 1000; // 10 minute
    const acceesTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET as string;
    const refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET as string;
    const dataStoredInToken: DataStoredInToken = {
      id: user.id,
    };

    await this.tokenRepository
      .createQueryBuilder()
      .delete()
      .where("token.deviceId = :deviceId", { deviceId })
      .andWhere("token.userId = :userId", { userId: user.id })
      .execute();

    const accessToken = await jwt.sign(dataStoredInToken, acceesTokenSecret, {
      expiresIn,
    });
    const refreshToken = await jwt.sign(dataStoredInToken, refreshTokenSecret);

    const token = this.tokenRepository.create({
      accessToken,
      refreshToken,
      deviceId,
      user,
    });

    await this.tokenRepository.save(token);
    return {
      expiresIn,
      accessToken,
      refreshToken,
    };
  }

  public async findToken(user: User, refreshToken: string) {
    return await this.tokenRepository.findOne({
      where: {
        user,
        refreshToken,
      },
    });
  }

  public async findTokenByDeviceId(user: User, deviceId: string) {
    return await this.tokenRepository.findOne({
      where: {
        user,
        deviceId,
      },
    });
  }

  public async deleteToken(user: User, deviceId: string) {
    await this.tokenRepository
      .createQueryBuilder()
      .delete()
      .where("token.deviceId = :deviceId", { deviceId })
      .andWhere("token.userId = :userId", { userId: user.id })
      .execute();
  }
}

export default TokenService;
