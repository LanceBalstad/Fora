import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import { Login } from "../components/Login/Login";
import Create_Account from "../components/Create_Account/Create_Account";
import Import_Products from "../components/Import_Products/Import_Products";
import { auth } from "../config/Firebase";
import Product_List from "../components/Product_List/Product_List";
import OpenAI_Helper from "../components/OpenAI_Helper/OpenAI_Helper";
import Layout from "./Layout";

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
    path: "/import_products",
    element: (
      <Layout>
        <Import_Products />
      </Layout>
    ),
  },
  {
    path: "/product_list",
    element: (
      <Layout>
        <Product_List />
      </Layout>
    ),
  },
  {
    path: "/openai_helper",
    element: (
      <Layout>
        <OpenAI_Helper />
      </Layout>
    ),
  },
]);
