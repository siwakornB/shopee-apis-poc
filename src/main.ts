import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { connectDB } from './config/db';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    connectDB();
    await app.listen(process.env.PORT ?? 8088);
}
bootstrap();
