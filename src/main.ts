import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import multer from 'multer'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  //app.use(json());   //Parse JSON bodies
  //app.use(express.urlencoded({ extended: true }));   //For URL-encoded forms x-www-form-urlencoded (HTML forms)
  //app.useGlobalInterceptors(new FileInterceptor('file'));  //Apply FileInterceptor globally
  app.use(multer().none()); //Parse multipart/form-data (non-file fields)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Strip non-DTO fields (if the user of someone else tries to inject a field that's not defined in the DTO, it will be removed)
      forbidNonWhitelisted: true, // Reject requests with extra fields
      transform: true,            // Auto-convert payloads to DTO instances
    }),
  );

  
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()

