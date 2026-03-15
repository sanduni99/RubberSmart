// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';


// Layouts
import WebsiteLayout from './layouts/WebsiteLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Website pages
import Home from './pages/website/Home';
import About from './pages/website/About';
import Features from './pages/website/Features';
import Tapping from './pages/website/Tapping';
import Contact from './pages/website/Contact';

// Auth pages
import Login from './pages/auth/login';
import Signup from './pages/auth/signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import Users from "./pages/admin/Users";
// Dashboard pages
import Dashboard from './pages/dashboard/Dashboard';
import YieldPrediction from './pages/dashboard/YieldPrediction';
import PriceIntelligence from './pages/dashboard/PriceIntelligence';
import Profile from './components/dashboard/Profile';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<WebsiteLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="features" element={<Features />} />
            <Route path="tapping" element={<Tapping />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
         <Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<AdminDashboard />} />
</Route>
<Route path="/admin/users" element={<Users />} />

          {/* Protected Dashboard Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="yield-prediction" element={<YieldPrediction />} />
            <Route path="price-intelligence" element={<PriceIntelligence />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;