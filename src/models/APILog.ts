import mongoose, { Schema, Document } from 'mongoose'

export interface IAPILog extends Document {
  service: string // 'sureverifications', 'stripe', etc.
  endpoint: string
  method: string
  statusCode?: number
  success: boolean
  requestBody?: Record<string, any>
  responseBody?: Record<string, any>
  errorMessage?: string
  errorStack?: string
  retryCount: number
  userId?: mongoose.Types.ObjectId
  orderId?: mongoose.Types.ObjectId
  transactionId?: mongoose.Types.ObjectId
  duration: number // in ms
  ipAddress?: string
  createdAt: Date
}

const apiLogSchema = new Schema<IAPILog>(
  {
    service: { type: String, required: true },
    endpoint: { type: String, required: true },
    method: { type: String, required: true },
    statusCode: Number,
    success: { type: Boolean, required: true },
    requestBody: Schema.Types.Mixed,
    responseBody: Schema.Types.Mixed,
    errorMessage: String,
    errorStack: String,
    retryCount: { type: Number, default: 0 },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    duration: { type: Number, required: true },
    ipAddress: String,
  },
  { timestamps: true }
)

// TTL Index - keep logs for 30 days
apiLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 })

// Indexes for querying
apiLogSchema.index({ service: 1 })
apiLogSchema.index({ success: 1 })
apiLogSchema.index({ userId: 1 })
apiLogSchema.index({ createdAt: -1 })
apiLogSchema.index({ statusCode: 1 })

export default mongoose.models.APILog ||
  mongoose.model<IAPILog>('APILog', apiLogSchema)
