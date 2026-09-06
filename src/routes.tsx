import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { RouteObject } from 'react-router-dom';
import App from './App';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './features/auth/context/AuthContext';

const EmergencyPage = lazy(() => import('./pages/EmergencyPage'));
const OHSPage = lazy(() => import('./pages/OHSPage'));
const MedicalPage = lazy(() => import('./pages/MedicalPage'));
const SurgicalPage = lazy(() => import('./pages/SurgicalPage'));
const IntegrationDemoPage = lazy(() => import('./pages/IntegrationDemoPage'));
const PatientDetail = lazy(() => import('./features/dashboard/PatientDetail'));
const PatientDirectory = lazy(() => import('./features/dashboard/PatientDirectory'));
const ServerQueueAdmin = lazy(() => import('./features/admin/ServerQueueAdmin'));

const LoadingFallback = () => <div className="loading">Loading...</div>;
const lazyPage = (element: ReactNode) => <Suspense fallback={<LoadingFallback />}>{element}</Suspense>;

export const routes: RouteObject[] = [
  {
    element: <AuthProvider />,
    children: [
      { path: '/login', element: <LoginPage /> },
      {
        element: <App />,
        children: [
          { path: '/', element: <Dashboard /> },
          { path: '/home', element: <Dashboard /> },
          { path: '/emergency', element: lazyPage(<EmergencyPage />) },
          { path: '/ohs', element: lazyPage(<OHSPage />) },
          { path: '/medical', element: lazyPage(<MedicalPage />) },
          { path: '/surgical', element: lazyPage(<SurgicalPage />) },
          { path: '/integration-demo', element: lazyPage(<IntegrationDemoPage />) },
          { path: '/patients', element: lazyPage(<PatientDirectory />) },
          { path: '/patient/:id', element: lazyPage(<PatientDetail />) },
          { path: '/admin', element: lazyPage(<ServerQueueAdmin />) },
        ],
      },
    ],
  },
];
