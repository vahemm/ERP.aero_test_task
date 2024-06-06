import HttpException from "./HttpException";

class WrongFileIdException extends HttpException {
  constructor() {
    super(400, "Wrong file id");
  }
}

export default WrongFileIdException;