import HttpException from "./HttpException";

class WrongRefreshTokenException extends HttpException {
  constructor() {
    super(401, "Wrong refresh token");
  }
}

export default WrongRefreshTokenException;
