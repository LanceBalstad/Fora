import React, { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../../config/Firebase";
import { getTableRef } from "../../utils/firestorePaths";
import { getDoc } from "firebase/firestore";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tableId, setTableId] = useState<string | null>(
    localStorage.getItem("activeTableId")
  );
  const [tableName, setTableName] = useState<string | null>(null);

  useEffect(() => {
    if (location.pathname === "/table_list") {
      localStorage.removeItem("activeTableId");
      setTableId(null);
      setTableName(null);
    } else {
      const storedId = localStorage.getItem("activeTableId");
      if (storedId) {
        setTableId(storedId);
        fetchTableName(storedId);
      }
    }
  }, [location.pathname]);

  const fetchTableName = async (tableId: string) => {
    const userUid = auth.currentUser?.uid;
    if (!userUid) return;

    try {
      const tableRef = getTableRef(userUid, tableId);
      const tableSnap = await getDoc(tableRef);
      if (tableSnap.exists()) {
        setTableName(tableSnap.data().tableName);
      }
    } catch (error) {
      console.error("Error fetching table name:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("activeTableId");
      setTableId(null);
      setTableName(null);
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link
          to="/table_list"
          className={`nav-link ${
            location.pathname === "/table_list" ? "active-link" : ""
          }`}
        >
          Table List
        </Link>
        {tableId && (
          <>
            <Link
              to={`/product_list/${tableId}`}
              className={`nav-link ${
                location.pathname === `/product_list/${tableId}`
                  ? "active-link"
                  : ""
              }`}
            >
              Table View
            </Link>
            <Link
              to="/import_products"
              className={`nav-link ${
                location.pathname === "/import_products" ? "active-link" : ""
              }`}
            >
              Import Table
            </Link>
          </>
        )}
      </div>

      {tableName && <div className="table-name">{`${tableName}`}</div>}

      <button onClick={logout} className="logout-button">
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
