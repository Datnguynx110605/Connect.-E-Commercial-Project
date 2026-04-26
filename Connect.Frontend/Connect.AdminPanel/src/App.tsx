/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Categories } from './pages/Categories';
import { Coupons } from './pages/Coupons';
import { Orders } from './pages/Orders';
import { Reviews } from './pages/Reviews';
import { Users } from './pages/Users';
import { Payments } from './pages/Payments';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      {
        path: '/',
        element: <Dashboard />,
      },
      {
        path: '/products',
        element: <Products />,
      },
      {
        path: '/categories',
        element: <Categories />,
      },
      {
        path: '/coupons',
        element: <Coupons />,
      },
      {
        path: '/orders',
        element: <Orders />,
      },
      {
        path: '/reviews',
        element: <Reviews />,
      },
      {
        path: '/users',
        element: <Users />,
      },
      {
        path: '/payments',
        element: <Payments />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />
      }
    ]
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}
