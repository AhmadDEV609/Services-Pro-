
import { Routes, Route } from "react-router-dom";

import CustomerHome from "./pages/CustomerHome";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import CustomerService from "./pages/CustomerService";

import ProviderProtected from "./pages/ProviderProtected";
import AdminProtected from "./pages/AdminProtected";
import CustomerProtected from "./pages/CustomerProtected";

import ProviderDashboard from "./Provider/ProviderDashboard";
import ProviderProfile from "./Provider/ProviderProfile";
import ProviderBooking from "./Provider/ProviderBooking";

import Explore from "./pages/Explore";
import CustomerBooking from "./pages/CustomerBooking";
import CustomerProfile from "./pages/CustomerProfile";
import ExploreDetail from "./pages/ExploreDetail";

import AdminDashboard from "./Admin/AdminDashboard";
import AdminNavbar from "./Admin/AdminNavbar";
import Request from "./Admin/Request";

const App = () => {

  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<CustomerHome />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/services" element={<CustomerService />} />

      {/* Customer Routes */}
      <Route
        path="/customer"
        element={<CustomerProtected />}
      >
        <Route path="explore" element={<Explore />} />
        <Route path="booking" element={<CustomerBooking />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route
          path="provider/:providerId"
          element={<ExploreDetail />}
        />
      </Route>

      {/* Provider Routes */}
      <Route
        path="/provider"
        element={<ProviderProtected />}
      >
        <Route path="dashboard" element={<ProviderDashboard />} />
        <Route path="profile" element={<ProviderProfile />} />
        <Route path="booking" element={<ProviderBooking />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={<AdminProtected />}
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="navbar" element={<AdminNavbar />} />
        <Route path="request" element={<Request />} />
      </Route>

    </Routes>
  );
};

export default App;
