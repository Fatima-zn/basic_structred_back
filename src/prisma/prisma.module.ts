import { PrismaService } from './prisma.service';
import { Module, Global } from '@nestjs/common';

@Global() //By adding this, no need to import PrismaModule every time we need it in the other modules
@Module({
    imports: [],
    controllers: [],
    providers: [PrismaService],
    exports: [PrismaService]
})
export class PrismaModule { }
