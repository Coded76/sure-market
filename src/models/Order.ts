import mongoose, { Schema, Document } from 'mongoose'

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId
  serviceType: 'local' | 'global' // Server 1 or Server 2
  service: string // Service ID from provider
  country: string
  countryCode?: string
  phoneNumber?: string
  price: number
  currency: string
  status: 'pending' | 'purchased' | 'verified' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  providerOrderId?: string // From SureVerifications
  smsContent?: string
  smsReceivedAt?: Date
  smsCheckCount: number
  lastSmsCheckAt?: Date
  verificationStatus: 'pending' | 'received' | 'timeout' | 'cancelled'
  verificationAttempts: number
  cancellationReason?: string
  cancelledAt?: Date
  refundAmount?: number
  refundReason?: string
  refundedAt?: Date
  expiresAt: Date
  metadata?: Record<string, any>
  errorLog: Array<{
    timestamp: Date
    error: string
    code?: string
  }>
  createdAt: Date
  updatedAt: Date
}

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    serviceType: {
      type: String,
      enum: ['local', 'global'],
      required: true,
    },
    service: { type: String, required: true },
    country: { type: String, required: true },
    countryCode: String,
    phoneNumber: String,
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: ['pending', 'purchased', 'verified', 'completed', 'failed', 'cancelled', 'refunded'],
      default: 'pending',
    },
    providerOrderId: String,
    smsContent: String,
    smsReceivedAt: Date,
    smsCheckCount: { type: Number, default: 0 },
    lastSmsCheckAt: Date,
    verificationStatus: {
      type: String,
      enum: ['pending', 'received', 'timeout', 'cancelled'],
      default: 'pending',
    },
    verificationAttempts: { type: Number, default: 0 },
    cancellationReason: String,
    cancelledAt: Date,
    refundAmount: Number,
    refundReason: String,
    refundedAt: Date,
    expiresAt: { type: Date, required: true },
    metadata: Schema.Types.Mixed,
    errorLog: [
      {
        timestamp: { type: Date, default: Date.now },
        error: String,
        code: String,
      },
    ],
  },
  { timestamps: true }
)

// TTL Index - automatically delete orders 30 days after creation
orderSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 })

// Indexes
orderSchema.index({ userId: 1 })
orderSchema.index({ status: 1 })
orderSchema.index({ verificationStatus: 1 })
orderSchema.index({ createdAt: -1 })
orderSchema.index({ providerOrderId: 1 })
orderSchema.index({ expiresAt: 1 })

export default mongoose.models.Order ||
  mongoose.model<IOrder>('Order', orderSchema)
