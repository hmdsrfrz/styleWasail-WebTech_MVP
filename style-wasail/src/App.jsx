import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/main/Home";
import UserHome from "./pages/main/UserHome";
import Moodboards from "./pages/moodboard/Moodboards";
import MoodboardDetails from "./pages/moodboard/MoodboardDetails";
import Renting from "./pages/renting-dashboard/RentingDashboard";
import Account from "./pages/account-settings/AccountSettings";
import { MoodboardProvider } from "./context/MoodboardContext";

export default function App() {
  return (
    <BrowserRouter>
      <MoodboardProvider>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<Home />} />
          {/* User Dashboard and Linked Pages */}
          <Route path="/user-home" element={<UserHome />} />
          <Route path="/moodboards" element={<Moodboards />} />
          <Route path="/moodboards/:moodboardId" element={<MoodboardDetails />} />
          <Route path="/renting" element={<Renting />} />
          <Route path="/account" element={<Account />} />
          {/* Add a redirect/catch-all route for better UX */}
          <Route path="*" element={<Home />} />
        </Routes>
      </MoodboardProvider>
    </BrowserRouter>
  );
}