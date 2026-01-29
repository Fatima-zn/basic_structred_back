import { Controller, Get, UseGuards, Body, Patch, Param} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import * as client from '@prisma/client';
import { UserService } from './user.service';
import { editUserDto } from './dto';


@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
    constructor(private service: UserService){}

    //MOVING THE GUARD TO THE CONTROLLER LEVEL IN ORDER TO PROTECT ALL ROUTES IN THIS CONTROLLER
    //@UseGuards(JwtGuard) //'jwt' is the default strategy name for JWT authentication, we can change it in the JwtStrategy class
    @Get("me")
    getUser(@GetUser() user: client.User){ //after validation, the user object is added to the request object so we can access it here
        console.log("User:", user);
        return user; //req.user is the user object that was added by the JwtStrategy.validate method
    }

    @Get()
    getAll(){
        return 'So many users out there!';
    }

    @Patch('edit_profile')
    editUser(@GetUser("userId") uid: string, @Body() dto: editUserDto){ //userId passed here is the field name of the id in the returned payload from the validation function (jwt strategy)

        const user = this.service.editUser(uid, dto);
        console.log("User has been edited!");

        return user;
    }


}


