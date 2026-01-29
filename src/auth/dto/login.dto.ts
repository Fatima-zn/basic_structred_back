import { IsNotEmpty, MinLength, IsEmail, IsString } from "class-validator";

export class LogInDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;
}