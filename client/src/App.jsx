import { Routes, Route } from 'react-router-dom';
import { Home as HomeIcon, UserCircle, CalendarCheck, Wallet, UtensilsCrossed, LifeBuoy, LayoutDashboard, BedDouble, Users, ScrollText, FileText, Settings, Inbox } from 'lucide-react';
import PublicLayout from './layouts/PublicLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import { RequireAuth } from './routes/Guards.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Rooms from './pages/Rooms.jsx';
import RoomDetail from './pages/RoomDetail.jsx';
import Facilities from './pages/Facilities.jsx';
import Gallery from './pages/Gallery.jsx';
import Contact from './pages/Contact.jsx';
import Mess from './pages/Mess.jsx';
import Policy from './pages/Policy.jsx';
import { Login, Register, Forgot, Reset, NotFound } from './pages/Auth.jsx';
import POverview from './pages/portal/Overview.jsx';
import PProfile from './pages/portal/Profile.jsx';
import PBookings from './pages/portal/Bookings.jsx';
import PPayments from './pages/portal/Payments.jsx';
import PMess from './pages/portal/MessSubs.jsx';
import PSupport from './pages/portal/Support.jsx';
import Receipt from './pages/portal/Receipt.jsx';
import AOverview from './pages/admin/Overview.jsx';
import ARooms from './pages/admin/Rooms.jsx';
import AResidents from './pages/admin/Residents.jsx';
import ABookings from './pages/admin/Bookings.jsx';
import APayments from './pages/admin/Payments.jsx';
import AMess from './pages/admin/Mess.jsx';
import APolicies from './pages/admin/Policies.jsx';
import AContacts from './pages/admin/Contacts.jsx';
import AContent from './pages/admin/Content.jsx';

const portalLinks = [['/portal', 'Overview', LayoutDashboard, true], ['/portal/bookings', 'My Bookings', CalendarCheck], ['/portal/payments', 'Rent & Payments', Wallet], ['/portal/mess', 'Mess Subscriptions', UtensilsCrossed], ['/portal/profile', 'My Profile', UserCircle], ['/portal/support', 'Support', LifeBuoy]];
const adminLinks = [['/admin', 'Overview', LayoutDashboard, true], ['/admin/bookings', 'Bookings', CalendarCheck], ['/admin/rooms', 'Rooms & Beds', BedDouble], ['/admin/residents', 'Residents', Users], ['/admin/payments', 'Rent & Payments', Wallet], ['/admin/mess', 'Mess Plans & Customers', UtensilsCrossed], ['/admin/mess-payments', 'Mess Payments', Wallet], ['/admin/policies', 'Terms & Policies', ScrollText], ['/admin/content', 'Website Content', Settings], ['/admin/contacts', 'Enquiries', Inbox]];

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} /><Route path="about" element={<About />} /><Route path="rooms" element={<Rooms />} /><Route path="rooms/:id" element={<RoomDetail />} />
        <Route path="facilities" element={<Facilities />} /><Route path="gallery" element={<Gallery />} /><Route path="contact" element={<Contact />} /><Route path="mess" element={<Mess />} />
        <Route path="terms" element={<Policy page="terms" />} /><Route path="rules" element={<Policy page="rules" />} /><Route path="privacy" element={<Policy page="privacy" />} />
        <Route path="login" element={<Login />} /><Route path="register" element={<Register />} /><Route path="forgot-password" element={<Forgot />} /><Route path="reset-password" element={<Reset />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/portal" element={<RequireAuth><DashboardLayout title="Resident Portal" links={portalLinks} whatsapp /></RequireAuth>}>
        <Route index element={<POverview />} /><Route path="bookings" element={<PBookings />} /><Route path="payments" element={<PPayments />} /><Route path="receipt/:id" element={<Receipt />} />
        <Route path="mess" element={<PMess />} /><Route path="profile" element={<PProfile />} /><Route path="support" element={<PSupport />} />
      </Route>
      <Route path="/admin" element={<RequireAuth admin><DashboardLayout title="Admin Panel" links={adminLinks} /></RequireAuth>}>
        <Route index element={<AOverview />} /><Route path="bookings" element={<ABookings />} /><Route path="rooms" element={<ARooms />} /><Route path="residents" element={<AResidents />} />
        <Route path="payments" element={<APayments />} /><Route path="mess-payments" element={<APayments mess />} /><Route path="receipt/:id" element={<Receipt back="/admin/payments" />} />
        <Route path="mess" element={<AMess />} /><Route path="policies" element={<APolicies />} /><Route path="content" element={<AContent />} /><Route path="contacts" element={<AContacts />} />
      </Route>
    </Routes>
  );
}
