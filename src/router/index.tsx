import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { FilesPage, Home, Login } from '../pages'

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "storage",
    element: <FilesPage />
  }
];

export const router = createBrowserRouter(routes);