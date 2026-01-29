import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { Injectable } from "@nestjs/common";



@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get<string>("JWT_SECRET") || 'defaultSecret'
        });
    }

    async validate(payload: any) {
        console.log('Validating JWT payload:', payload);

        return {
            userId: payload.sub,
            email: payload.email,
            name: payload.name || 'Unknown User'
        }; //Any thing returned here will be added to the request object as req.user
    }


}