import React, { useEffect, useState } from "react";
import OpenAI_Helper from "../OpenAI_Helper/OpenAI_Helper";
import { db, auth } from "../../config/Firebase";
import {
  query,
  where,
  getDocs,
  collection,
  deleteDoc,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./Product_List.css";

interface Product {
  id: string;
  [key: string]: any; // Allows for dynamic properties in each product
}

function Product_List() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editedProductData, setEditedProductData] = useState<Product | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  const productsCollectionRef = collection(db, "products");

  const getProductList = async (userUid: string) => {
    try {
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

      // Initialize headers only if not already set
      if (headers.length === 0) {
        const allHeaders = Array.from(
          new Set(
            filteredData.flatMap((product) =>
              Object.keys(product).filter(
                (key) => key !== "userId" && key !== "id"
              )
            )
          )
        );
        setHeaders(allHeaders);
      }
    } catch (err) {
      console.error("Error fetching product list:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        getProductList(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

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

  const toggleEdit = (productId: string) => {
    if (editingProductId === productId) {
      saveProduct(productId);
    } else {
      setEditingProductId(productId);
      const productToEdit = productList.find(
        (product) => product.id === productId
      );
      setEditedProductData(productToEdit || null);
    }
  };

  const saveProduct = async (productId: string) => {
    if (!editedProductData) return;

    try {
      const userUid = auth.currentUser?.uid;
      if (!userUid) return;

      if (productId === "new") {
        // Exclude the `id` field before adding
        const { id, ...productData } = editedProductData;
        await addDoc(productsCollectionRef, {
          ...productData,
          userId: userUid,
        });
      } else {
        // Update existing product
        const productDoc = doc(db, "products", productId);
        await updateDoc(productDoc, editedProductData);
      }

      getProductList(userUid);
      setEditingProductId(null);
      setEditedProductData(null);
    } catch (err) {
      console.error("Error saving product:", err);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setEditedProductData((prevData) => ({
      ...(prevData || { id: "" }),
      [field]: value,
    }));
  };

  const addNewProduct = () => {
    const newProduct: Product = { id: "new" };
    headers.forEach((header) => {
      newProduct[header] = ""; // Initialize all fields as empty
    });
    setProductList((prev) => [newProduct, ...prev]);
    setEditingProductId("new");
    setEditedProductData(newProduct);
  };

  const filteredProducts = productList.filter((product) =>
    headers.some(
      (header) =>
        product[header]
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ?? false
    )
  );

  return (
    <>
      {/* Add OpenAI_Helper here, passing the productList and headers (columns) */}
      <OpenAI_Helper productList={productList} columns={headers} />

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
      <div>Product List</div>
      <div className="table container">
        <table className="table table-striped">
          <thead className="thead-light">
            <tr>
              {headers.map((header, index) => (
                <th scope="col" key={index}>
                  {header}
                </th>
              ))}
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                {headers.map((header, index) => (
                  <td key={index}>
                    {editingProductId === product.id ? (
                      <input
                        type="text"
                        value={
                          editedProductData ? editedProductData[header] : ""
                        }
                        onChange={(e) =>
                          handleFieldChange(header, e.target.value)
                        }
                      />
                    ) : (
                      product[header]
                    )}
                  </td>
                ))}
                <td>
                  <div style={{ display: "flex", gap: "5px" }}>
                    <button onClick={() => toggleEdit(product.id)}>
                      {editingProductId === product.id ? "Save" : "Edit"}
                    </button>
                    {product.id !== "new" && (
                      <button onClick={() => deleteProduct(product.id)}>
                        Delete
                      </button>
                    )}
                  </div>
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
