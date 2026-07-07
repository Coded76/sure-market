import mongoose, { Schema, Document } from 'mongoose'

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId
  type: 'topup' | 'purchase' | 'refund' | 'withdrawal'
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  description: string
  paymentGateway?: string // 'stripe', 'flutterwave', etc.
  paymentGatewayReference?: string
  paymentMethod?: string // 'card', 'bank_transfer', 'wallet'
  orderId?: mongoose.Types.ObjectId // If transaction is for an order
  failureReason?: string
  failureCode?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  processedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['topup', 'purchase', 'refund', 'withdrawal'],
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'NGN' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    description: { type: String, required: true },
    paymentGateway: String,
    paymentGatewayReference: String,
    paymentMethod: String,
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    failureReason: String,
    failureCode: String,
    metadata: Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
    processedAt: Date,
  },
  { timestamps: true }
)

// Indexes
transactionSchema.index({ userId: 1 })
transactionSchema.index({ type: 1 })
transactionSchema.index({ status: 1 })
transactionSchema.index({ createdAt: -1 })
transactionSchema.index({ paymentGatewayReference: 1 })

export default mongoose.models.Transaction ||
  mongoose.model<ITransaction>('Transaction', transactionSchema)
