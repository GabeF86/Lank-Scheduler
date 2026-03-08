import mongoose from 'mongoose'

const AssignmentSchema = new mongoose.Schema({
  id: String,
  type: { type: String, enum: ['MD', 'CRNA'] },
  role: String,
  site: String,
  isSolo: Boolean,
  is8101: Boolean,
  isCardiac: Boolean,
  isFloat: Boolean,
  isAddOn: Boolean,
  isTEE: Boolean,
  supervisedBy: String,
  supervises: [String],
  notes: String,
}, { _id: false })

const BreakAnalysisSchema = new mongoose.Schema({
  demand: Number,
  capacity: Number,
  gap: Number,
  pct: Number,
  severity: String,
  unrelieved: Number,
}, { _id: false })

const ContingencySchema = new mongoose.Schema({
  fromId: String,
  toId: String,
  type: String,
  label: String,
}, { _id: false })

const ScheduleSchema = new mongoose.Schema({
  hospitalId: { type: String, required: true, index: true },
  date: { type: String, required: true }, // ISO date string: "2026-03-07"

  // Site configuration used to generate this schedule
  config: {
    mainOR: Number, addOnRooms: Number,
    apc: Number, cardiac: Number,
    endo: Number, ep: Number, epTEE: Boolean,
    csections: Number, ir: Boolean,
  },

  // Staff availability at time of generation
  availability: {
    mds: Number,
    crnas: Number,
  },

  // Computed result (stored so it can be recalled/shared)
  assignments: [AssignmentSchema],
  notes: [String],
  contingencies: [ContingencySchema],
  breakAnalysis: BreakAnalysisSchema,

  // Who last saved this schedule
  savedBy: String, // Clerk userId
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
})

// Unique schedule per hospital per date
ScheduleSchema.index({ hospitalId: 1, date: 1 }, { unique: true })

export default mongoose.model('Schedule', ScheduleSchema)
