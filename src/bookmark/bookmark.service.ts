import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookmarkDto } from './dto';


@Injectable()
export class BookmarkService {
    constructor(private prisma: PrismaService){}

    async createBookmark(uid: string, dto: BookmarkDto){
        return await this.prisma.bookmark.create({
            data: {
                title: dto.title,
                url: dto.url,
                description: dto.description,
                userId: uid
            }
        });


        //Or

/*         await this.prisma.bookmark.create({
            data: {
                ...dto,
                user: {
                    connect: { id: uid}
                }
            }
        }); */

        //this approach uses the user field which used to create the relation between the two tables in order to connect this bookmark to this user with this id
    }



    async getAll(){
        return await this.prisma.bookmark.findMany({
            select: {
                title: true,
                url: true,
                description: true,
                createdAt: true,
                user: {
                    select: {
                        name: true
                    }
                }
            },

            orderBy: {
                createdAt: "desc"
            } 
        });
    }



    async getBookmark(bid: string){
        return await this.prisma.bookmark.findUnique({
            where: {
                id: bid
            },

            select: {
                title: true,
                url: true,
                description: true,
                createdAt: true,
                user: {
                    select: {
                        name: true
                    }
                }
            }
        });
    }



    async editBookmark(uid: string, bid: string, dto: BookmarkDto){
        const ownerId = await this.prisma.bookmark.findFirst({
            where: {
                id : bid
            },
            select: {
                userId: true
            }
        });


        if(!ownerId || ownerId.userId !== uid) throw new ForbiddenException("Access denied");

        return await this.prisma.bookmark.update({
            where: {
                id: bid
            },

            data: {
                ...dto
            }
        })
    }


    async deleteBookmark(uid: string, bid: string){
        const ownerId = await this.prisma.bookmark.findFirst({
            where: {
                id : bid
            },
            select: {
                userId: true
            }
        });


        if(!ownerId || ownerId.userId !== uid) throw new ForbiddenException("Access denied");

        return await this.prisma.bookmark.delete({
            where: {
                id: bid
            }
        });
    }
}
