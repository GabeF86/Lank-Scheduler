import mongoose from 'mongoose'

const StaffSchema = new mongoose.Schema({
  hospitalId: { type: String, required: true, index: true },
  clerkUserId: String,       // link to Clerk user if they have login access
  firstName: String,
  lastName: String,
  email: String,
  type: { type: String, enum: ['MD', 'CRNA'] }, // set by admin after webhook creates the doc
  specialty: String,         // e.g. "Cardiac", "General", "Endo"
  active: { type: Boolean, default: true },
}, {
  timestamps: true,
})

StaffSchema.index({ hospitalId: 1, type: 1 })

export default mongoose.model('Staff', StaffSchema)
