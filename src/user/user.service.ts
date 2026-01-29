import { Injectable } from '@nestjs/common';
import { editUserDto } from './dto';
import { plainToInstance } from 'class-transformer';
import { UserResDto } from '../auth/dto/user_res.dto';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class UserService {
    constructor(private prisma: PrismaService){}
    async editUser(uid: string, dto: editUserDto){
        const user = await this.prisma.user.update({
            where: {
                id: uid
            },
            data: {
                ...dto
            }
        });


        return plainToInstance(UserResDto, user);
    }
}
