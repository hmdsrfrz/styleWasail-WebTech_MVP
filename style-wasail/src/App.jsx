import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import UserHome from "./pages/UserHome";
import Moodboards from "./pages/Moodboards";
import Renting from "./pages/RentingDashboard";
import Account from "./pages/AccountSettings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Home />} />

        {/* User Dashboard and Linked Pages */}
        <Route path="/user-home" element={<UserHome />} />
        <Route path="/moodboards" element={<Moodboards />} />
        <Route path="/renting" element={<Renting />} />
        <Route path="/account" element={<Account />} />

        {/* TODO: Add login and other routes */}
      </Routes>
    </BrowserRouter>
  );
}
