import React from "react";
import { signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../config/Firebase";
import "./Navbar.css";

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

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/product_list" className="nav-link">
          Product List
        </Link>
        <Link to="/import_products" className="nav-link">
          Import Products
        </Link>
      </div>
      <button onClick={logout} className="logout-button">
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
