import React, { useState } from "react";
import { getDocs, deleteDoc, addDoc, collection } from "firebase/firestore";
import { auth, db } from "../../../config/Firebase";
import Row from "./Row/Row";
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
  getProductList: (userUid: string) => void;
  tableId: string | undefined;
}

function Table({
  productList,
  setProductList,
  headers,
  getProductList,
  tableId,
}: TableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = productList.filter((product) =>
    headers.some((header) =>
      product[header]
        ?.toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  );

  const addNewProduct = async () => {
    const userUid = auth.currentUser?.uid;
    if (!userUid || !tableId) return;

    try {
      // Create a new blank product with the required fields
      const newProduct: Product = headers.reduce(
        (acc, header) => {
          acc[header] = ""; // Set each field to empty
          return acc;
        },
        { id: "new" } as Product // Explicitly cast to Product
      );

      // Add the new product to the Firestore collection
      const productsRef = getProductsCollectionRef(userUid, tableId);
      const docRef = await addDoc(productsRef, newProduct);

      // Update the productList with the new product, including the Firestore document ID
      setProductList((prev) => [
        ...prev,
        { ...newProduct, id: docRef.id }, // Add the Firestore-generated ID
      ]);

      // Optionally, you can call getProductList() if you need to refresh the product list from Firestore
      getProductList(userUid);
    } catch (err) {
      console.error("Add new product error:", err);
    }
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
          <thead className="thead-light">
            <tr>
              {headers.map((header, idx) => (
                <th key={idx}>{header}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <Row
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
