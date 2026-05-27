import mongoose, { Schema, Document } from 'mongoose'

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId
  adminId?: mongoose.Types.ObjectId
  action: string
  resource: string // e.g., 'user', 'order', 'wallet', 'transaction'
  resourceId?: string
  changes?: Record<string, any>
  status: 'success' | 'failure'
  errorMessage?: string
  ipAddress?: string
  userAgent?: string
  method: string // 'GET', 'POST', 'PUT', 'DELETE'
  endpoint: string
  statusCode: number
  responseTime: number // in ms
  metadata?: Record<string, any>
  createdAt: Date
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    adminId: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: String,
    changes: Schema.Types.Mixed,
    status: {
      type: String,
      enum: ['success', 'failure'],
      required: true,
    },
    errorMessage: String,
    ipAddress: String,
    userAgent: String,
    method: { type: String, required: true },
    endpoint: { type: String, required: true },
    statusCode: { type: Number, required: true },
    responseTime: { type: Number, required: true },
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
)

// TTL Index - keep logs for 90 days
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 })

// Indexes for querying
auditLogSchema.index({ userId: 1 })
auditLogSchema.index({ adminId: 1 })
auditLogSchema.index({ action: 1 })
auditLogSchema.index({ resource: 1 })
auditLogSchema.index({ createdAt: -1 })
auditLogSchema.index({ statusCode: 1 })

export default mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>('AuditLog', auditLogSchema)
