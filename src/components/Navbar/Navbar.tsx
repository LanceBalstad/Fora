import React, { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../../config/Firebase";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tableId, setTableId] = useState<string | null>(
    localStorage.getItem("activeTableId")
  );

  useEffect(() => {
    // If user navigates to /table_list, clear the tableId
    if (location.pathname === "/table_list") {
      localStorage.removeItem("activeTableId");
      setTableId(null);
    } else {
      const storedId = localStorage.getItem("activeTableId");
      if (storedId) setTableId(storedId);
    }
  }, [location.pathname]);

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("activeTableId");
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/table_list" className="nav-link">
          Table List
        </Link>
        {tableId && (
          <>
            <Link to={`/product_list/${tableId}`} className="nav-link">
              Product List
            </Link>
            <Link to="/import_products" className="nav-link">
              Import Products
            </Link>
          </>
        )}
      </div>
      <button onClick={logout} className="logout-button">
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
