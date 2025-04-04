import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import { Login } from "../components/Login/Login";
import Create_Account from "../components/Create_Account/Create_Account";
import Import_Products from "../components/Import_Products/Import_Products";
import { auth } from "../config/Firebase";
import Product_List_Page from "../components/Product_List_Page/Product_List_Page";
import Table_List_Page from "../components/Table_List/Table_List";
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
    path: "/product_list/:tableId",
    element: (
      <Layout>
        <Product_List_Page />
      </Layout>
    ),
  },

  {
    path: "/table_list",
    element: (
      <Layout>
        <Table_List_Page />
      </Layout>
    ),
  },
]);
