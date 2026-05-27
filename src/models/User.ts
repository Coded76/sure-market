import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  email: string
  passwordHash: string
  firstName: string
  lastName: string
  country?: string
  phoneNumber?: string
  emailVerified: boolean
  emailVerificationToken?: string
  emailVerificationTokenExpiry?: Date
  twoFactorEnabled: boolean
  twoFactorSecret?: string
  status: 'active' | 'suspended' | 'pending' | 'deleted'
  role: 'user' | 'admin'
  apiKey?: string
  apiKeyHash?: string
  lastLogin?: Date
  loginAttempts: number
  lockUntil?: Date
  profilePicture?: string
  bio?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  preferences: {
    emailNotifications: boolean
    smsNotifications: boolean
    loginAlerts: boolean
  }
  activityLog: Array<{
    action: string
    timestamp: Date
    ipAddress?: string
    userAgent?: string
  }>
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'],
    },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    country: String,
    phoneNumber: String,
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationTokenExpiry: Date,
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String,
    status: {
      type: String,
      enum: ['active', 'suspended', 'pending', 'deleted'],
      default: 'pending',
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    apiKey: String,
    apiKeyHash: String,
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    profilePicture: String,
    bio: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      loginAlerts: { type: Boolean, default: true },
    },
    activityLog: [
      {
        action: String,
        timestamp: { type: Date, default: Date.now },
        ipAddress: String,
        userAgent: String,
      },
    ],
    deletedAt: Date,
  },
  { timestamps: true }
)

// Indexes
userSchema.index({ createdAt: -1 })
userSchema.index({ status: 1 })
userSchema.index({ apiKeyHash: 1 })

export default mongoose.models.User ||
  mongoose.model<IUser>('User', userSchema)
