import { IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";

export class BookmarkDto{
    @IsString()
    @IsNotEmpty()
    title: string

    @IsUrl()
    url: string

    @IsString()
    @IsOptional()
    description?: string
}