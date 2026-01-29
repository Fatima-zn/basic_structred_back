import { Exclude } from "class-transformer";

export class UserResDto {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;

    @Exclude()
    hash: string;

}