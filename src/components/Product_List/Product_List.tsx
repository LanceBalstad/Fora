import React from "react";
import "./Product_List.css";
import { useEffect, useState } from "react";
import { db, auth } from "../../config/Firebase";
import { query, where, getDocs, collection, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";

interface Product {
  id: string;
  [key: string]: any; // Allows for dynamic properties in each product
}

function Product_List() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  const productsCollectionRef = collection(db, "products");

  const getProductList = async () => {
    try {
      const userUid = auth.currentUser?.uid;
      if (!userUid) return;

      const queriedData = query(
        productsCollectionRef,
        where("userId", "==", userUid)
      );
      const data = await getDocs(queriedData);
      
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Product[];

      setProductList(filteredData);

      // Extract headers dynamically, excluding 'userId' and 'id'
      const dynamicHeaders = Object.keys(filteredData[0] || {}).filter(
        (header) => header !== "userId" && header !== "id"
      );
      setHeaders(dynamicHeaders);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const productDoc = doc(db, "products", id);
      await deleteDoc(productDoc);
      setProductList((prev) => prev.filter((product) => product.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAllProducts = async () => {
    try {
      const userUid = auth.currentUser?.uid;
      if (!userUid) {
        console.error("User is not authenticated");
        return;
      }

      const queriedData = query(
        productsCollectionRef,
        where("userId", "==", userUid)
      );
      const data = await getDocs(queriedData);
      
      const deletePromises = data.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      setProductList([]);
      console.log("All products deleted successfully!");
    } catch (err) {
      console.error("Error deleting all products:", err);
    }
  };

  // const onSubmitProduct = async () => {
  //   try {
  //     await addDoc(productsCollectionRef, {
  //       name: newProductName,
  //       purchaseDate: newPurchaseDate,
  //       purchaseCost: newPurchaseCost,
  //       quality: newQuality,
  //       userId: auth?.currentUser?.uid,
  //     });
  //     getProductList();
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  useEffect(() => {
    getProductList();
  }, []);

  return (
    <>
      <button onClick={deleteAllProducts} style={{ marginLeft: "10px", color: "red" }}>
        Delete All Products
      </button>
      <div>Product List</div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {productList.map((product) => (
              <tr key={product.id}>
                {headers.map((header, index) => (
                  <td key={index}>{product[header]}</td>
                ))}
                <td>
                  <button onClick={() => deleteProduct(product.id)}>Delete</button>
                  <button>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Product_List;
