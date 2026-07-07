import mongoose, { Schema, Document } from 'mongoose'

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId
  balance: number
  currency: string
  totalDeposited: number
  totalSpent: number
  totalRefunded: number
  lastTopUpDate?: Date
  status: 'active' | 'frozen' | 'suspended'
  createdAt: Date
  updatedAt: Date
}

const walletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    balance: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'NGN' },
    totalDeposited: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    totalRefunded: { type: Number, default: 0 },
    lastTopUpDate: Date,
    status: {
      type: String,
      enum: ['active', 'frozen', 'suspended'],
      default: 'active',
    },
  },
  { timestamps: true }
)

// Indexes
walletSchema.index({ userId: 1 })
walletSchema.index({ createdAt: -1 })

export default mongoose.models.Wallet ||
  mongoose.model<IWallet>('Wallet', walletSchema)
