import { Expose } from "class-transformer";
import { IsEmail, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateUserDto {
  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  @IsEmail()
  email: string;

  @Expose()
  @IsString()
  password: string;

  @Expose()
  @IsOptional()
  @IsNumber()
  age?: number;
}
