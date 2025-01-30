import mongoose, { Schema, Document } from 'mongoose';

export interface IShopeeAuthorization extends Document {
    accessToken: string;
    timeStamp: Number;
    refreshToken: string;
}

const shopeeAuthorizationSchema: Schema = new Schema(
    {
        accessToken: { type: String, required: true },
        timeStamp: { type: String, required: true },
        refreshToken: { type: String, required: true },
        // email: { type: String, required: false, unique: false },
    },
    { collection: 'shopee_authorization' }
);

// Export the model
export const ShopeeAuthorization = mongoose.model<IShopeeAuthorization>(
    'ShopeeAuthorization',
    shopeeAuthorizationSchema
);
