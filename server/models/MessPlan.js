import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 1000 },
  mealsPerDay: { type: Number, required: true, min: 1, max: 4 },
  includedMeals: { type: String, trim: true, maxlength: 200 },
  monthlyPrice: { type: Number, required: true, min: 0 },
  timings: { type: String, trim: true, maxlength: 300 },
  menu: { type: String, trim: true, maxlength: 2000 },
  menuImage: String,
  diningOption: { type: String, enum: ['dine_in', 'takeaway', 'both'], default: 'both' },
  active: { type: Boolean, default: true }
}, { timestamps: true });
export default mongoose.model('MessPlan', schema);
