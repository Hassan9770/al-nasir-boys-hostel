// Usage: npm run seed   (creates admin from env + sample rooms/facilities/mess plans/policy templates; safe to re-run)
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { env, assertEnv } from '../config/env.js';
assertEnv();
const { connectDB } = await import('../config/db.js');
const { default: User } = await import('../models/User.js');
const { default: Room } = await import('../models/Room.js');
const { default: MessPlan } = await import('../models/MessPlan.js');
const { default: HostelPolicy } = await import('../models/HostelPolicy.js');
const { default: HostelSettings } = await import('../models/HostelSettings.js');

await connectDB();

if (!env.adminEmail || !env.adminPassword || env.adminPassword.length < 10) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (min 10 chars) in server/.env before seeding.'); process.exit(1);
}
if (!(await User.findOne({ email: env.adminEmail.toLowerCase() }))) {
  await User.create({ name: env.adminName, email: env.adminEmail, phone: env.adminPhone, role: 'admin', residentCategory: 'Other', passwordHash: await bcrypt.hash(env.adminPassword, 12) });
  console.log('Admin created:', env.adminEmail);
} else console.log('Admin already exists, skipped');

const facilities = [
  ['beds', 'Furnished beds and wardrobes', 'Comfortable beds with personal storage.', 'BedDouble', true],
  ['wifi', 'High-speed Wi-Fi', 'Internet access for study and work.', 'Wifi', true],
  ['study', 'Study tables and chairs', 'A proper place to study or work.', 'BookOpen', true],
  ['security', '24/7 security', 'Enable only if provided.', 'ShieldCheck', false],
  ['cctv', 'CCTV surveillance (common areas)', 'Enable only if installed.', 'Cctv', false],
  ['washroom', 'Clean attached washrooms', 'Attached washrooms, cleaned regularly.', 'ShowerHead', true],
  ['water', 'Filtered drinking water', 'Safe drinking water available.', 'Droplets', true],
  ['laundry', 'Washing machine service', 'Enable only if provided.', 'WashingMachine', false],
  ['backup', 'Electricity backup', 'Enable only if provided.', 'Zap', false],
  ['mess', 'Mess service (two meals per day)', 'Two meals per day through the hostel mess.', 'UtensilsCrossed', true],
  ['kitchen', 'Kitchen / dining area', 'Enable only if provided.', 'CookingPot', false],
  ['common', 'Relaxation and common area', 'Enable only if provided.', 'Sofa', false],
  ['parking', 'Parking', 'Enable only if available.', 'ParkingCircle', false],
  ['iron', 'Iron with stand', 'Enable only if provided.', 'Shirt', false]
].map(([key, name, description, icon, enabled]) => ({ key, name, description, icon, enabled }));

if (!(await HostelSettings.findOne({ singleton: 'main' }))) {
  await HostelSettings.create({
    singleton: 'main',
    description: 'AL NASIR BOYS HOSTEL offers clean, safe and affordable accommodation for male students, job holders and working residents. [Edit this text in Admin > Website Content.]',
    mission: 'To provide comfortable, disciplined and affordable accommodation that feels like home. [Edit before launch.]',
    vision: 'To be a trusted name in hostel accommodation for students and working men. [Edit before launch.]',
    messIntro: 'Our mess serves two meals per day to hostel residents and to people living outside the hostel. Timings, menus and prices are set by management. [Edit before launch.]',
    phone: '+92 000 0000000', email: 'info@example.com', address: '[Hostel address — update in Admin]',
    whatsappNumber: '920000000000', officeHours: '[e.g. Mon–Sat, 9:00 AM – 8:00 PM]', mapLink: '', mapEmbedUrl: '',
    facilities,
    whyChooseUs: [
      { title: 'Safe and disciplined', text: 'Clear house rules that apply equally to every resident.' },
      { title: 'Clean rooms', text: 'Regularly cleaned rooms and washrooms.' },
      { title: 'Transparent pricing', text: 'Monthly rent and mess prices are published up front.' },
      { title: 'For students and workers', text: 'Open to students, job holders and other eligible male residents.' }
    ],
    faqs: [
      { q: 'Who can stay at the hostel?', a: 'Male students, job holders, workers and other eligible residents, subject to hostel policies.' },
      { q: 'How do I book a room?', a: 'Create an account, choose a room and submit a booking request. Management reviews and approves it.' },
      { q: 'Can I take only the mess service?', a: 'Yes. People living outside the hostel can subscribe to the mess without booking a room.' },
      { q: 'How is rent paid?', a: 'Payment methods and due dates are set by management and shown before you confirm a booking.' }
    ]
  });
  console.log('Settings created');
}
if ((await Room.countDocuments()) === 0) {
  await Room.insertMany([
    { roomNumber: 'S-01', type: 'Single', monthlyRent: 15000, totalBeds: 1, facilities: ['Bed', 'Wardrobe', 'Study table'], description: 'Sample single room. Update price and details.' },
    { roomNumber: 'D-01', type: 'Double', monthlyRent: 10000, totalBeds: 2, facilities: ['Beds', 'Wardrobes', 'Study tables'], description: 'Sample double room. Update price and details.' },
    { roomNumber: 'T-01', type: 'Triple', monthlyRent: 8000, totalBeds: 3, facilities: ['Beds', 'Wardrobes', 'Study tables'], description: 'Sample triple room. Update price and details.' },
    { roomNumber: 'SH-01', type: 'Shared', monthlyRent: 6000, totalBeds: 6, facilities: ['Beds', 'Lockers'], description: 'Sample shared room. Update price and details.' }
  ]);
  console.log('Sample rooms created (placeholder prices!)');
}
if ((await MessPlan.countDocuments()) === 0) {
  await MessPlan.create({ name: 'Two Meals / Day', description: 'Sample plan. Update before launch.', mealsPerDay: 2, includedMeals: 'Meals as configured by management', monthlyPrice: 9000, timings: '[Set meal timings]', menu: '[Set menu]', diningOption: 'both' });
  console.log('Sample mess plan created (placeholder price!)');
}
const TPL = '[TEMPLATE — review, edit and have it checked by a qualified person before publishing. This is not legal advice.]\n\n';
const policies = {
  terms: ['Terms & Conditions', '## Accommodation Terms\n\n- **Eligibility:** Male residents including students, job holders and workers, subject to hostel approval.\n- **Identity verification:** [Describe what is required at check-in.]\n- **Room allocation:** Rooms and beds are allocated by management based on availability.\n- **Rent:** Monthly rent and due dates are shown on the booking page and in the Payment Policy.\n- **Security deposit:** [State amount and conditions, or "not applicable".]\n- **Check-in / check-out:** [Describe procedure and notice period.]\n- **Minimum stay:** [State, or "none".]\n- **Booking approval and cancellation:** Bookings are confirmed only after management approval.\n- **Room changes and extensions:** Subject to availability and approval.\n- **Damage:** Residents are responsible for damage they cause to hostel property.\n- **Personal belongings:** [State the hostel\'s position on responsibility.]'],
  rules: ['Hostel Rules & Conduct Policy', '## House Rules\n\n- Treat residents and staff with respect.\n- Keep rooms, washrooms and shared areas clean.\n- Observe quiet hours: [set times].\n- Visitors: [describe the guest policy].\n- Follow security procedures set by management.\n- Illegal activities are prohibited.\n- Violence, harassment and threats are prohibited.\n- Take care of hostel property and shared facilities.\n- Use Wi-Fi, washrooms, kitchen and common areas appropriately.\n- Comply with applicable laws and reasonable hostel policies.'],
  mess: ['Mess Service Terms & Conditions', '## Mess Terms\n\n- Plan prices and included meals are shown on the Mess page.\n- Subscriptions run from the approved start date to the end date.\n- Payment deadline: [set in Admin > Website Content].\n- Meal timings and menus are set by management and may change.\n- Food is prepared and handled hygienically.\n- Missed meals / unused subscription days: [state policy].\n- Cancellation and refunds: [state policy].\n- External customers: [state whether they may dine at the hostel or must collect meals].\n- Dietary limitations: [describe].'],
  payment: ['Payment, Cancellation & Refund Policy', '## Payments\n\n- Rent due date: [set].\n- Mess payment deadline: [set].\n- Accepted methods: [Cash, Bank Transfer, etc.].\n- Late payments: [describe the procedure — no penalty applies unless stated here].\n- Outstanding balances: [describe handling].\n\n## Cancellation and refunds\n\n- Cancellation rules: [describe].\n- Refund eligibility: [describe].\n- Security deposit conditions: [describe].'],
  privacy: ['Privacy Policy', '## What we collect\n\nName, phone, email, resident category, emergency contact and details needed for accommodation, plus booking, payment and mess records.\n\n## Why\n\nTo manage accommodation, payments, mess service and safety.\n\n## Who can see it\n\nYou and authorised hostel management only. We do not publish residents\' phone numbers, identity documents or payment records.\n\n## Corrections\n\nContact management to correct your information.\n\n## Retention\n\n[State how long records are kept.]']
};
for (const [type, [title, content]] of Object.entries(policies)) {
  if (!(await HostelPolicy.findOne({ type }))) await HostelPolicy.create({ type, title, content: TPL + content, version: 1, published: true, publishedAt: new Date() });
}
console.log('Policy templates ready. Seed complete.');
await mongoose.disconnect();
