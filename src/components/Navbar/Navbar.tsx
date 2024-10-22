import React from "react";
import { signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../config/Firebase";

const Navbar = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const goToImport_Products = async () => {
    try {
      navigate("/import_products");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <button onClick={logout}>Logout</button>
      <Link to="/product_list">Product List</Link>
      <Link to="/import_products">Import Products through an Excel Sheet</Link>
    </>
  );
};

export default Navbar;
