import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards, HttpCode } from '@nestjs/common';
import { BookmarkDto } from './dto';
import { BookmarkService } from './bookmark.service';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { HTTP_CODE_METADATA } from '@nestjs/common/constants';

@UseGuards(JwtGuard)
@Controller('bookmark')
export class BookmarkController {
    constructor(private service: BookmarkService){}

    @Post('/create-new-bookmark')
    createBookmark(@GetUser("userId") uid: string, @Body() dto: BookmarkDto){
        console.log("From creation of the bookmark, userId: ", uid);
        console.log("the dto that the route handler received: ", dto);
        return this.service.createBookmark(uid, dto);
    }

    @Get('/all')
    getAllBookmarks(){
        return this.service.getAll();
    }

    @Get(':id')
    getBookmarkById(@Param("id") bid: string){
        return this.service.getBookmark(bid);
    }

    @Patch('edit/:id')
    editBookmarkById(@GetUser("userId") uid: string, @Param('id') bid: string, @Body() dto: BookmarkDto){
        return this.service.editBookmark(uid, bid, dto);
    }

    @HttpCode(204)
    @Delete('delete/:id')
    deleteBookmarkById(@GetUser("userId") uid: string, @Param('id') bid: string){
        return this.service.deleteBookmark(uid, bid);
    }
}


