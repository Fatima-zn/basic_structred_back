import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class editUserDto {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsEmail()
    email: string
}