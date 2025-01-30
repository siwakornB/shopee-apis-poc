import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ShopeeService } from './shopee/shopee.service';

@Module({
    imports: [],
    controllers: [AppController],
    providers: [AppService, ShopeeService],
})
export class AppModule {}
