import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ShopeeService } from './shopee/shopee.service';

@Controller()
export class AppController {
    constructor(private readonly shopeeService: ShopeeService) {}

    @Get('/gen-code-url')
    async generateCodeUrl() // @Query('partnerKey') partnerKey: string // @Query('redirectUrl') redirectUrl: string, // @Query('partnerId') partnerId: number,
    {
        const url = await this.shopeeService.generateCodeUrl();
        return { url };
    }

    @Post('/get-access-token')
    async getTokenAccessTokenShopLevel(
        @Body('code') code: string
        // @Body('partnerId') partnerId: number,
        // @Body('partnerKey') partnerKey: string,
        // @Body('shopId') shopId: number
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const response = this.shopeeService.getTokenAccessTokenShopLevel(code);
        return response;
    }

    @Get('/order/get-list')
    async getOrderList() // @Query('partnerId') partnerId: number,
    // @Query('partnerKey') partnerKey: string,
    // @Query('shopId') shopId: number
    : Promise<Object> {
        const response = this.shopeeService.getOrderList();
        return response;
    }

    @Get('/order/get-details')
    async getOrderDetails(
        // @Query('partnerId') partnerId: number,
        // @Query('partnerKey') partnerKey: string,
        // @Query('shopId') shopId: number,
        @Query('orderSnList') orderSnList: string
    ): Promise<Object> {
        const response = this.shopeeService.getOrderDetails(orderSnList);
        return response;
    }

    @Get('/order/get-shipment-list')
    async getShipmentList() // @Query('partnerId') partnerId: number,
    // @Query('partnerKey') partnerKey: string,
    // @Query('shopId') shopId: number
    : Promise<Object> {
        const response = this.shopeeService.getShipmentList();
        return response;
    }
}
