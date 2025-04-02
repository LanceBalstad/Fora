import React, { useState } from "react";
import { getDocs, deleteDoc } from "firebase/firestore";
import { auth } from "../../../config/Firebase";
import Rows from "./Rows/Rows";
import Column from "./Columns/Columns";
import "../Product_List.css";
import { getProductsRef } from "../../../utils/firestorePaths";
import Loading_Screen from "../../Loading_Screen/Loading_Screen";

interface Product {
  id: string;
  [key: string]: any;
}

interface TableProps {
  productList: Product[];
  setProductList: React.Dispatch<React.SetStateAction<Product[]>>;
  headers: string[];
  setHeaders: React.Dispatch<React.SetStateAction<string[]>>;
  getProductList: (userUid: string) => void;
  tableId: string | undefined;
  toggleOpenAI: () => void; // New prop for toggling OpenAI_Helper
  showOpenAI: boolean; // Current state of OpenAI_Helper visibility
}

function Table({
  productList,
  setProductList,
  headers,
  setHeaders,
  getProductList,
  tableId,
  toggleOpenAI,
  showOpenAI,
}: TableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  const filteredProducts = productList.filter((product) =>
    headers.some((header) =>
      product[header]
        ?.toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  );

  const addNewProduct = () => {
    const newProduct: Product = { id: "new" };
    headers.forEach((header) => (newProduct[header] = ""));
    setProductList((prev) => [newProduct, ...prev]);
  };

  const deleteAllProducts = async () => {
    if (
      window.confirm(
        "This will permanently delete every row in this table. Are you sure you want to continue?"
      )
    ) {
      const userUid = auth.currentUser?.uid;
      if (!userUid || !tableId) return;
      try {
        setLoading(true);
        const productsRef = getProductsRef(userUid, tableId);
        const querySnap = await getDocs(productsRef);
        await Promise.all(querySnap.docs.map((doc) => deleteDoc(doc.ref)));
        setProductList([]);
      } catch (err) {
        console.error("Delete all error:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="tableactions">
        {loading && <Loading_Screen message="Deleting all Rows..." />}
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="action-buttons">
          <button onClick={addNewProduct} className="changeProductButton">
            Add Row
          </button>
          <button onClick={deleteAllProducts} className="changeProductButton">
            Delete All Rows
          </button>
          <button onClick={toggleOpenAI} className="changeProductButton">
            {showOpenAI ? "Hide AI Chat" : "Show AI Chat"}
          </button>
        </div>
      </div>

      <div className="table container">
        <table className="table table-striped">
          <Column
            headers={headers}
            setHeaders={setHeaders}
            tableId={tableId || ""}
          />
          <tbody>
            {filteredProducts.map((product) => (
              <Rows
                key={product.id}
                product={product}
                headers={headers}
                setProductList={setProductList}
                getProductList={getProductList}
                tableId={tableId}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Table;
