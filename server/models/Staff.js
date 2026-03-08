import mongoose from 'mongoose'

const StaffSchema = new mongoose.Schema({
  hospitalId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['MD', 'CRNA'], required: true },
  specialty: String,         // e.g. "Cardiac", "General", "Endo"
  active: { type: Boolean, default: true },
  clerkUserId: String,       // link to Clerk user if they have login access
}, {
  timestamps: true,
})

StaffSchema.index({ hospitalId: 1, type: 1 })

export default mongoose.model('Staff', StaffSchema)
