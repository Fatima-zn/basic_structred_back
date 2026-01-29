import { createParamDecorator, ExecutionContext } from "@nestjs/common";


export const GetUser = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => { //data is anything to add inside the brackets when using the decorator, in this case we don't need any (example: @GetUser('something'))
        const request: Express.Request = ctx.switchToHttp().getRequest();
        const userObject = request.user;
        
        return data? userObject?.[data] : userObject;
    }
)