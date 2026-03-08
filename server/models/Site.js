import mongoose from 'mongoose'

const SiteSchema = new mongoose.Schema({
  hospitalId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  operatingDays: [String], // e.g. ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  linkedSiteIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Site' }],
  active: { type: Boolean, default: true },
}, {
  timestamps: true,
})

export default mongoose.model('Site', SiteSchema)
