import { Routes, Route } from 'react-router-dom'

import CustomerHome from './pages/CustomerHome.tsx'
import Signup from './pages/Signup.tsx'
import Login from './pages/Login.tsx'
import CustomerService from './pages/CustomerService.tsx'

import ProviderProtected from './pages/ProviderProtected.tsx'
import AdminProtected from './pages/AdminProtected.tsx'
import CustomerProtected from './pages/CustomerProtected.tsx'

import ProviderDashboard from './Provider/ProviderDashboard.tsx'
import ProviderProfile from './Provider/ProviderProfile.tsx'
import ProviderBooking from './Provider/ProviderBooking.tsx'

import Explore from './pages/Explore.tsx'
import CustomerBooking from './pages/CustomerBooking.tsx'
import CustomerProfile from './pages/CustomerProfile.tsx'
import ExploreDetail from './pages/ExploreDetail.tsx'

import AdminDashboard from './Admin/AdminDashboard.tsx'
import AdminNavbar from './Admin/AdminNavbar.tsx'
import Request from './Admin/Request.tsx'
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<CustomerHome />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/services" element={<CustomerService />} />

      <Route path="/customer" element={<CustomerProtected />}>
        <Route path="explore" element={<Explore />} />
        <Route path="booking" element={<CustomerBooking />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="provider/:providerId" element={<ExploreDetail />} />
      </Route>

      <Route path="/provider" element={<ProviderProtected />}>
        <Route path="dashboard" element={<ProviderDashboard />} />
        <Route path="profile" element={<ProviderProfile />} />
        <Route path="booking" element={<ProviderBooking />} />
      </Route>

      <Route path="/admin" element={<AdminProtected />} >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="navbar" element={<AdminNavbar />} />
        <Route path="request" element={<Request />} />
      </Route>
    </Routes>
  )
}

export default App
