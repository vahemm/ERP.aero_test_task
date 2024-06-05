import { Type } from "class-transformer";
import {
  isEmail,
  isPhoneNumber,
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "email-or-phone-number", async: false })
export class IsEmailOrPhoneNumber implements ValidatorConstraintInterface {
  validate(text: any, args: ValidationArguments) {
    return isEmail(text) || isPhoneNumber(text);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be email or phone number`;
  }
}

export class CreateUserDto {
  @IsString()
  public fullName: string;

  @IsString()
  public deviceId: string;

  @Validate(IsEmailOrPhoneNumber)
  public id: string;

  @IsString()
  public password: string;
}

export class SignInUserDto {
  @IsString()
  public deviceId: string;

  @Validate(IsEmailOrPhoneNumber)
  public id: string;

  @IsString()
  public password: string;
}
