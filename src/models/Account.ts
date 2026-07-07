import mongoose, { Schema, Document } from 'mongoose'

export type AccountPlatform = 'facebook' | 'instagram' | 'twitter' | 'whatsapp' | 'tiktok'

export interface IAccount extends Document {
  platform: AccountPlatform
  emailOrPhone: string
  password: string
  twoFactorSecret?: string
  price: number
  status: 'available' | 'sold' | 'reserved'
  boughtBy?: mongoose.Types.ObjectId
  boughtAt?: Date
  description?: string
  createdAt: Date
  updatedAt: Date
}

const accountSchema = new Schema<IAccount>(
  {
    platform: {
      type: String,
      enum: ['facebook', 'instagram', 'twitter', 'whatsapp', 'tiktok'],
      required: true,
      default: 'facebook',
    },
    emailOrPhone: { type: String, required: true },
    password: { type: String, required: true },
    twoFactorSecret: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['available', 'sold', 'reserved'],
      default: 'available',
    },
    boughtBy: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    boughtAt: Date,
    description: { type: String, default: '' },
  },
  { timestamps: true }
)

// Indexes
accountSchema.index({ status: 1 })
accountSchema.index({ platform: 1, status: 1 })
accountSchema.index({ createdAt: -1 })

export default mongoose.models.Account ||
  mongoose.model<IAccount>('Account', accountSchema)
