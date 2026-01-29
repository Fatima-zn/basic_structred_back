import { Injectable, Body, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from './dto/auth.dto';
import * as argon from 'argon2';
import { plainToInstance } from "class-transformer";
import { UserResDto } from "./dto/user_res.dto";
import { Prisma } from "@prisma/client";
import { LogInDto } from "./dto/login.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config"; 


@Injectable()
export class AuthService{
    constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService){}


    async signup(@Body() dto: AuthDto){
        console.log("Signing up...");

        //generate the hash for the password
        const hash = await argon.hash(dto.password);

        try{
            //create the user in the database
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash,
                    name: dto.name
                }
            });

            const output = await this.SignToken(user.id, user.email, user.name? user.name : 'Unknown User');


            //return plainToInstance(UserResDto, user); //transform the user object to UserResDto
            return {
                access_token: output
            };

            
        } catch (e){
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002'){ //although it's enough to check the error code to handle such an error, but for security reasons, it's better to check the error type as well 
                throw new ForbiddenException('Credentials taken');
            }

            throw e;
        }


    }


    async login(@Body() dto: LogInDto){
        console.log("Logging in...");

        //find user by email
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        });
        //if email doesn't exist, throw an error
        if (!user) throw new ForbiddenException('Credentials incorrect');

        //then compare password with the hash in db
        const IsMatch = await argon.verify(user.hash, dto.password);

        //if password is correct, return the user
        //const result = plainToInstance(UserResDto, user);
        const result = await this.SignToken(user.id, user.email, user.name? user.name : 'Unknown User');

        if (IsMatch) return {
            access_token: result,
            message: "login successful"
        };

        //else, throw an exception
        throw new ForbiddenException('Credentials incorrect: Invalid password');
    }


    myFunction(){
        console.log("Hello Fatima! hope you're doing well");
        return "hi there!"
    }


    SignToken(userId: string, email: string, name: string) : Promise<string> {
        const payload = {
            sub: userId,
            email,
            name
        }

        const secret = this.config.get("JWT_SECRET");

        return this.jwt.signAsync(payload, {
            expiresIn: '15min',
            secret
        })
    }
}
