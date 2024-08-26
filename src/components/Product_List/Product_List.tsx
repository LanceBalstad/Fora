import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { db, auth } from "../../config/Firebase";
import { query, where } from "firebase/firestore";
import {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

interface Product {
  id: string;
  name: string;
  purchaseDate: string;
  purchaseCost: number;
  sellingCost: number;
}

function Product_List() {
  console.log(auth.currentUser?.uid);

  const navigate = useNavigate();

  const logout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const [productList, setProductList] = useState<Product[]>([]);

  const [newProductName, setNewProductName] = useState("");
  const [newPurchaseDate, setNewPurchaseDate] = useState("");
  const [newPurchaseCost, setNewPurchaseCost] = useState(0);
  const [newSellingCost, setNewSellingCost] = useState(0);

  const [updatedName, setUpdatedName] = useState("");

  const productsCollectionRef = collection(db, "products");

  const getProductList = async () => {
    try {
      const userUid = auth.currentUser?.uid;
      if (!userUid) return;

      const queriedData = query(
        productsCollectionRef,
        where("userId", "==", userUid.toString())
      );
      const data = await getDocs(queriedData);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Product[];
      setProductList(filteredData);
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

  const updateProductName = async (id: string) => {
    try {
      const productDoc = doc(db, "products", id);
      await updateDoc(productDoc, { name: updatedName });
      // Update the state to reflect the change
      setProductList((prev) =>
        prev.map((product) =>
          product.id === id ? { ...product, name: updatedName } : product
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getProductList();
  }, []);

  const onSubmitProduct = async () => {
    try {
      await addDoc(productsCollectionRef, {
        name: newProductName,
        purchaseDate: newPurchaseDate,
        purchaseCost: newPurchaseCost,
        sellingCost: newSellingCost,
        userId: auth?.currentUser?.uid,
      });

      getProductList();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div>Product_List</div>
      <button onClick={logout}>Logout</button>
      <div>
        <input
          type="text"
          placeholder="Product Name..."
          onChange={(e) => setNewProductName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Purchase Date..."
          onChange={(e) => setNewPurchaseDate(e.target.value)}
        />
        <input
          type="number"
          placeholder="Purchase Cost..."
          onChange={(e) => setNewPurchaseCost(Number(e.target.value))}
        />
        <input
          type="number"
          placeholder="Selling Cost..."
          onChange={(e) => setNewSellingCost(Number(e.target.value))}
        />
        <button onClick={onSubmitProduct}>Submit Product</button>
      </div>

      <div>
        {productList.map((product) => (
          <div key={product.id}>
            <h1>{product.name}</h1>
            <p>{product.purchaseDate}</p>
            <p>{product.purchaseCost}</p>
            <p>{product.sellingCost}</p>
            <button onClick={() => deleteProduct(product.id)}>
              Delete Product
            </button>

            <input
              type="text"
              placeholder="new name..."
              onChange={(e) => setUpdatedName(e.target.value)}
            />
            <button onClick={() => updateProductName(product.id)}>
              Update Name
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export default Product_List;
