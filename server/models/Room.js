import mongoose from 'mongoose'

const RoomSchema = new mongoose.Schema({
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
  hospitalId: { type: String, required: true }, // denormalized for hospital-wide queries
  name: { type: String, required: true },
  active: { type: Boolean, default: true },
}, {
  timestamps: true,
})

RoomSchema.index({ siteId: 1 })
RoomSchema.index({ hospitalId: 1 })

export default mongoose.model('Room', RoomSchema)
