import { IsString } from "class-validator";

export class LogoutDto { 
    @IsString()
    public deviceId: string;
  }