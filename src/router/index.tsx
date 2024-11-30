import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { Home, Login } from '../pages'

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "login",
    element: <Login />,
  }
];

export const router = createBrowserRouter(routes);