import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import { Login } from "./components/Login/Login";
import Create_Account from "./components/Create_Account/Create_Account";
import { db, auth } from "./config/Firebase";
import Product_List from "./components/Product_List/Product_List";

const isAuthenticated = () => {
  return auth.currentUser?.uid != null;
};

// Protected route component
const ProtectedRoute = ({ element }: { element: JSX.Element }) => {
  return isAuthenticated() ? element : <Navigate to="/" />;
};

export const Router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/create_account", element: <Create_Account /> },
  {
    path: "/product_list",
    element: <ProtectedRoute element={<Product_List />} />,
  },
]);
