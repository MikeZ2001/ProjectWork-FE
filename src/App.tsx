import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import AuthService from './services/auth.service';
import LoadingSpinner from "./components/ui/LoadingSpinner";

// Lazy-loaded components
const Layout = lazy(() => import('./components/layout/Layout'));
const Login = lazy(() => import('./components/auth/Login'));
const Register = lazy(() => import('./components/auth/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Auth guard for protected routes
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = AuthService.checkAuthStatus();

  if (!isAuthenticated) {
    return (
        <Navigate
            to="/login"
            replace
            state={{ error: 'You must be logged in to access this page.' }}
        />
    );
  }

  return <>{children}</>;
};

function App() {
  return (
      <div className="App">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
  );
}

export default App;
