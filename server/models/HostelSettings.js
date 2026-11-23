import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  singleton: { type: String, default: 'main', unique: true },
  hostelName: { type: String, default: 'AL NASIR BOYS HOSTEL' },
  tagline: { type: String, default: 'Your Second Home Away From Home' },
  description: String, mission: String, vision: String, heroImage: String, messIntro: String,
  phone: String, email: String, address: String,
  whatsappNumber: String, whatsappMessage: { type: String, default: 'Hello, I would like to enquire about room availability at AL NASIR BOYS HOSTEL.' },
  mapLink: String, mapEmbedUrl: String, officeHours: String,
  social: { facebook: String, instagram: String, youtube: String, tiktok: String },
  facilities: [{ key: String, name: String, description: String, icon: String, enabled: { type: Boolean, default: false }, _id: false }],
  whyChooseUs: [{ title: String, text: String, _id: false }],
  faqs: [{ q: String, a: String, _id: false }],
  payment: {
    rentDueDay: { type: Number, default: 5, min: 1, max: 28 },
    messPaymentDeadlineDays: { type: Number, default: 5, min: 0, max: 30 },
    methods: { type: [String], default: ['Cash', 'Bank Transfer'] }
  }
}, { timestamps: true });
export async function getSettings() {
  return (await mongoose.model('HostelSettings').findOne({ singleton: 'main' })) || (await mongoose.model('HostelSettings').create({ singleton: 'main' }));
}
export default mongoose.model('HostelSettings', schema);
