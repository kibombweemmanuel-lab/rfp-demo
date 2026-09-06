import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { routes } from './routes';
import './styles/index.css';

const router = createBrowserRouter(routes, {
  future: { v7_startTransition: true },
} as Parameters<typeof createBrowserRouter>[1]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);