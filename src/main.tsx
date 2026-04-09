import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { AuthProvider } from './app/context/AuthContext';
import Root from './app/pages/Root';
import Home from './app/pages/Home';
import Properties from './app/pages/Properties';
import PropertyDetail from './app/pages/PropertyDetail';
import Login from './app/pages/Login';
import Register from './app/pages/Register';
import Contact from './app/pages/Contact';
import AddProperty from './app/pages/AddProperty';
import SuperAdminDashboard from './app/pages/SuperAdminDashboard';
import AdminDashboard from './app/pages/AdminDashboard';
import SubAdminDashboard from './app/pages/SubAdminDashboard';
import UserDashboard from './app/pages/UserDashboard';
import PaymentPage from './app/pages/PaymentPage';
import './styles/globals.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: 'properties', element: <Properties /> },
      { path: 'properties/:id', element: <PropertyDetail /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'contact', element: <Contact /> },
      { path: 'add-property', element: <AddProperty /> },
      { path: 'dashboard', element: <UserDashboard /> },
      { path: 'admin', element: <AdminDashboard /> },
      { path: 'sub-admin', element: <SubAdminDashboard /> },
      { path: 'superadmin', element: <SuperAdminDashboard /> },
      { path: 'payment/:id', element: <PaymentPage /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
