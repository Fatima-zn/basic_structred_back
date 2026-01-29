import { Controller, Post, Body, HttpCode } from '@nestjs/common'
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { LogInDto } from './dto/login.dto';


@Controller('authentication')
export class AuthController{
    constructor(private authService: AuthService){
        this.authService.myFunction()
    }

    @Post('signup')
    //@UseInterceptors(FileInterceptor('file')) //NestJS doesn't parse multipart/form-data by default anymore, that's why we use Interceptors (I've comment it after i've search more and found that enabling multer globally is better in this case)
    SignUp(@Body() dto: AuthDto){
        return this.authService.signup(dto);
    }


    @Post('login')
    @HttpCode(200)
    LogIn(@Body() dto: LogInDto){
        return this.authService.login(dto);
    }
}