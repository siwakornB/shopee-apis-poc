import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import * as qs from 'qs'; // this format is working, do not use
import { ShopeeAuthorization } from 'src/entities/shopeeAuthorization';

@Injectable()
export class ShopeeService {
    async generateCodeUrl(
        partnerId: number,
        // redirectUrl: string,
        partnerKey: string
    ) {
        const timestamp = Math.floor(Date.now() / 1000);
        // const timestamp = 1738058203;
        const host = 'https://partner.test-stable.shopeemobile.com';
        const path = '/api/v2/shop/auth_partner';
        const redirectUrl = 'https://open.shopee.com/';

        const tmpBaseString = `${partnerId}${path}${timestamp}`;
        const baseString = Buffer.from(tmpBaseString).toString('utf-8');
        console.log('base', baseString);
        const encodedPartnerKey = Buffer.from(partnerKey).toString('utf-8');
        const sign = crypto
            .createHmac('sha256', encodedPartnerKey)
            .update(baseString)
            .digest('hex');

        const url = `${host}${path}?partner_id=${partnerId}&timestamp=${timestamp}&sign=${sign}&redirect=${redirectUrl}`;

        return url;
    }

    async getTokenAccessTokenShopLevel(
        code: string,
        partnerId: number,
        partnerKey: string,
        shopId: number
    ): Promise<{ accessToken: string; refreshToken: string }> {
        //https://partner.test-stable.shopeemobile.com/api/v2/auth/token/get
        const host = 'https://partner.test-stable.shopeemobile.com';
        const path = '/api/v2/auth/token/get';

        const { sign, timestamp } = this.calculateAuthenSign(
            partnerId,
            path,
            partnerKey
        );

        const url = `${host}${path}?partner_id=${partnerId}&timestamp=${timestamp}&sign=${sign}`;

        const headers = {
            'Content-Type': 'application/json',
        };
        const body = {
            code: code,
            shop_id: shopId,
            partner_id: partnerId,
        };

        const res = await this.executePost<{
            access_token: string;
            refresh_token: string;
        }>(url, headers, body);
        const { access_token, refresh_token } = res;

        try {
            const shopeeAuthorEntity = new ShopeeAuthorization({
                accessToken: access_token,
                timeStamp: timestamp,
                refreshToken: refresh_token,
            });
            await ShopeeAuthorization.deleteMany();
            await shopeeAuthorEntity.save();

            return { accessToken: access_token, refreshToken: refresh_token };
        } catch (error) {
            console.log('error', error);
            throw error;
        }
    }

    async getOrderList(
        partnerId: number,
        partnerKey: string,
        shopId: number
    ): Promise<Object> {
        const host = 'https://partner.test-stable.shopeemobile.com';
        const path = '/api/v2/order/get_order_list';

        const authorData = await ShopeeAuthorization.findOne();
        const accessToken = !!authorData ? authorData.accessToken : '';

        const { sign, timestamp } = this.calculateSign(
            partnerId,
            path,
            accessToken,
            shopId,
            partnerKey
        );

        const params = {
            // common params
            partner_id: partnerId,
            sign: sign,
            timestamp: timestamp,
            access_token: accessToken,
            shop_id: shopId,

            // required api params
            time_range_field: 'create_time',
            time_from: 1738107350,
            time_to: 1738193750,
            page_size: 20,
        };

        console.log(params);

        const queraParam = qs.stringify(params, { arrayFormat: 'brackets' });
        // const url = `${host}${path}?partner_id=${partnerId}&timestamp=${timestamp}&sign=${sign}`;
        const url = `${host}${path}?${queraParam}`;

        const headers = {
            'Content-Type': 'application/json',
        };

        const res = await this.executeGet<ShopeeResponse>(url, headers);

        return res.response;
    }

    async getOrderDetails(
        partnerId: number,
        partnerKey: string,
        shopId: number,
        orderSnList: string
    ): Promise<Object> {
        const host = 'https://partner.test-stable.shopeemobile.com';
        const path = '/api/v2/order/get_order_detail';

        const authorData = await ShopeeAuthorization.findOne();
        const accessToken = !!authorData ? authorData.accessToken : '';

        const { sign, timestamp } = this.calculateSign(
            partnerId,
            path,
            accessToken,
            shopId,
            partnerKey
        );

        const params = {
            // common params
            partner_id: partnerId,
            sign: sign,
            timestamp: timestamp,
            access_token: accessToken,
            shop_id: shopId,

            // required api params
            order_sn_list: orderSnList,

            // optional
            // request_order_status_pending
            // response_optional_fields
        };

        const queraParam = qs.stringify(params, { arrayFormat: 'brackets' });
        const url = `${host}${path}?${queraParam}`;

        const headers = {
            'Content-Type': 'application/json',
        };

        const res = await this.executeGet<ShopeeResponse>(url, headers);

        return res.response;
    }

    async getShipmentList(
        partnerId: number,
        partnerKey: string,
        shopId: number
    ): Promise<Object> {
        const host = 'https://partner.test-stable.shopeemobile.com';
        const path = '/api/v2/order/get_shipment_list';

        const authorData = await ShopeeAuthorization.findOne();
        const accessToken = !!authorData ? authorData.accessToken : '';

        const { sign, timestamp } = this.calculateSign(
            partnerId,
            path,
            accessToken,
            shopId,
            partnerKey
        );

        const params = {
            // common params
            partner_id: partnerId,
            sign: sign,
            timestamp: timestamp,
            access_token: accessToken,
            shop_id: shopId,

            // required api params
            page_size: 20,

            // optional
            // cursor
        };

        const queraParam = qs.stringify(params, { arrayFormat: 'brackets' });
        const url = `${host}${path}?${queraParam}`;

        const headers = {
            'Content-Type': 'application/json',
        };

        const res = await this.executeGet<ShopeeResponse>(url, headers);

        return res.response;
    }

    private async executeGet<T>(url: string, headers: Object): Promise<T> {
        try {
            console.log('url', url);
            const response = await axios.get<T>(url, headers);
            const data = response.data;
            return data;
        } catch (error) {
            console.error('Error fetching access token:');
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
                throw error.response.data;
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
            }
            throw error.message;
        }
    }

    private async executePost<T>(
        url: string,
        headers: Object,
        body: Object
    ): Promise<T> {
        try {
            console.log('url', url);
            console.log('req body', body);
            const response = await axios.post<T>(url, body, headers);
            const data = response.data;
            return data;
        } catch (error) {
            console.error('Error fetching access token:');
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
                throw error.response.data;
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
            }
            throw error.message;
        }
    }

    private calculateAuthenSign(
        partnerId: number,
        path: string,
        tmpPartnerKey: string
    ): { sign: string; timestamp: number } {
        const timestamp = Math.floor(Date.now() / 1000); // Current Unix timestamp
        const baseString = `${partnerId}${path}${timestamp}`;
        const partnerKey = Buffer.from(tmpPartnerKey, 'utf-8'); // Convert key to buffer
        const sign = crypto
            .createHmac('sha256', partnerKey)
            .update(baseString)
            .digest('hex'); // HMAC-SHA256 calculation

        return { sign, timestamp };
    }

    private calculateSign(
        partnerId: number,
        path: string,
        accessToken: string,
        shopId: number,
        partnerKey: string
    ): { sign: string; timestamp: number } {
        const timestamp = Math.floor(Date.now() / 1000); // Current Unix timestamp
        // const timestamp = 1738126880; // test
        // partner_id, api path, timestamp, access_token, shop_id and partner_key
        const baseString = `${partnerId}${path}${timestamp}${accessToken}${shopId}`;
        // const baseString = `${partnerId}${path}${timestamp}${accessToken}${shopId}${partnerKey}`; not working
        console.log('baseString', baseString);
        const bufferPartnerKey = Buffer.from(partnerKey, 'utf-8'); // Convert key to buffer
        const sign = crypto
            .createHmac('sha256', bufferPartnerKey)
            .update(baseString)
            .digest('hex'); // HMAC-SHA256 calculation

        return { sign, timestamp };
    }

    private generateSign(
        partnerId: number, // change
        path: string,
        timest: number,
        accessToken: string,
        shopId: number, // change
        partnerKey: string
    ): string {
        const tmpBaseString = `${partnerId}${path}${timest}${accessToken}${shopId}`;
        const baseString = Buffer.from(tmpBaseString, 'utf-8');
        const sign = crypto
            .createHmac('sha256', partnerKey)
            .update(baseString)
            .digest('hex');
        return sign;
    }
}
