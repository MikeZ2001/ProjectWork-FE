import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoadingSpinner from "./components/Ui/LoadingSpinner";
import TransactionManagement from "./pages/TransactionManagement";
import { AuthProvider } from './contexts/AuthContext';

// Lazy-loaded components
const Layout = lazy(() => import('./Layout'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

const AccountManagement = lazy(() => import('./pages/AccountManagement'));

const App:React.FC = () => {
    return (
        <AuthProvider>
            <div className="App">
                <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        <Route path="/" element={<Layout />}>
                            <Route index element={<Navigate to="/dashboard" replace />} />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="accounts" element={<AccountManagement />} />
                            <Route path="transactions" element={<TransactionManagement />} />
                        </Route>

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </div>
        </AuthProvider>
    );
}

export default App;
