import React, { useState } from "react";
import { getDocs, deleteDoc } from "firebase/firestore";
import { auth } from "../../../config/Firebase";
import Rows from "./Rows/Rows";
import Column from "./Columns/Columns"; // make sure this import path matches your structure
import "../Product_List.css";
import { getProductsCollectionRef } from "../../../utils/firestorePaths";

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
}

function Table({
  productList,
  setProductList,
  headers,
  setHeaders,
  getProductList,
  tableId,
}: TableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = productList.filter((product) =>
    headers.some((header) =>
      product[header]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const addNewProduct = () => {
    const newProduct: Product = { id: "new" };
    headers.forEach((header) => (newProduct[header] = ""));
    setProductList((prev) => [newProduct, ...prev]);
  };

  const deleteAllProducts = async () => {
    const userUid = auth.currentUser?.uid;
    if (!userUid || !tableId) return;
    try {
      const productsRef = getProductsCollectionRef(userUid, tableId);
      const querySnap = await getDocs(productsRef);
      await Promise.all(querySnap.docs.map((doc) => deleteDoc(doc.ref)));
      setProductList([]);
    } catch (err) {
      console.error("Delete all error:", err);
    }
  };

  return (
    <>
      <div className="tableactions">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button onClick={addNewProduct} className="changeProductButton">
          Add Product
        </button>
        <button onClick={deleteAllProducts} className="changeProductButton">
          Delete All Products
        </button>
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
