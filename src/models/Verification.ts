import mongoose, { Schema, Document } from 'mongoose'

export interface IVerification extends Document {
  userId: mongoose.Types.ObjectId
  orderId: mongoose.Types.ObjectId
  status: 'pending' | 'completed' | 'failed' | 'expired'
  smsContent?: string
  smsReceivedAt?: Date
  smsExpireAt: Date
  checkAttempts: number
  lastCheckAt?: Date
  providerVerificationId?: string
  errorMessage?: string
  retriesRemaining: number
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const verificationSchema = new Schema<IVerification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'expired'],
      default: 'pending',
    },
    smsContent: String,
    smsReceivedAt: Date,
    smsExpireAt: { type: Date, required: true },
    checkAttempts: { type: Number, default: 0 },
    lastCheckAt: Date,
    providerVerificationId: String,
    errorMessage: String,
    retriesRemaining: { type: Number, default: 10 },
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
)

// TTL Index - automatically delete after expiration + 7 days
verificationSchema.index(
  { smsExpireAt: 1 },
  { expireAfterSeconds: 604800 } // 7 days after expiration
)

// Indexes
verificationSchema.index({ userId: 1 })
verificationSchema.index({ orderId: 1 })
verificationSchema.index({ status: 1 })

export default mongoose.models.Verification ||
  mongoose.model<IVerification>('Verification', verificationSchema)
