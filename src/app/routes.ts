import { createBrowserRouter } from 'react-router';
import { Root } from './pages/Root';
import { Home } from './pages/Home';
import { Properties } from './pages/Properties';
import { PropertyDetailEnhanced as PropertyDetail } from './pages/PropertyDetailEnhanced';
import { Sell } from './pages/Sell';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';
import { SavedProperties } from './pages/SavedProperties';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: 'properties', Component: Properties },
      { path: 'properties/:id', Component: PropertyDetail },
      { path: 'sell', Component: Sell },
      { path: 'contact', Component: Contact },
      { path: 'login', Component: Login },
      { path: 'dashboard', Component: UserDashboard },
      { path: 'admin', Component: AdminDashboard },
      { path: 'super-admin', Component: SuperAdminDashboard },
      { path: 'saved', Component: SavedProperties },
    ],
  },
]);
