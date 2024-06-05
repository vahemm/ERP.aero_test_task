import HttpException from "./HttpException";

class WrongDeviceIdException extends HttpException {
  constructor() {
    super(401, "Wrong deviceId");
  }
}

export default WrongDeviceIdException;