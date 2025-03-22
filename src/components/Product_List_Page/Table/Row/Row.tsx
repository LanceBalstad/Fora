import React, { useState } from "react";
import {
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
} from "firebase/firestore";
import { auth, db } from "../../../../config/Firebase";
import { getProductRef } from "../../../../utils/firestorePaths";

interface Product {
  id: string;
  isNew?: boolean;
  [key: string]: any;
}

interface RowProps {
  product: Product;
  headers: string[];
  setProductList: React.Dispatch<React.SetStateAction<Product[]>>;
  getProductList: (userUid: string) => void;
  tableId: string | undefined;
}

function Row({
  product,
  headers,
  setProductList,
  getProductList,
  tableId,
}: RowProps) {
  const [isEditing, setIsEditing] = useState(product.isNew || false);
  const [editedData, setEditedData] = useState<Product>(product);

  const handleFieldChange = (field: string, value: string) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  //   const saveProduct = async () => {
  //     const userUid = auth.currentUser?.uid;
  //     if (!userUid || !tableId) return;
  //     try {
  //       const productData = { ...editedData, userId: userUid };

  //       if (product.isNew) {
  //         const { id, isNew, ...data } = productData;
  //         await addDoc(
  //           collection(db, "users", userUid, "tables", tableId, "products"),
  //           data
  //         );
  //       } else {
  //         const productRef = getProductRef(userUid, tableId, product.id);
  //         await updateDoc(productRef, productData);
  //       }

  //       getProductList(userUid);
  //       setIsEditing(false);
  //     } catch (err) {
  //       console.error("Save error:", err);
  //     }
  //   };

  const saveProduct = async () => {
    const userUid = auth.currentUser?.uid;
    if (!userUid || !tableId) return;
    try {
      const productData = { ...editedData, userId: userUid };

      // Update existing product
      const productRef = doc(
        db,
        "users",
        userUid,
        "tables",
        tableId,
        "products",
        product.id
      );
      await updateDoc(productRef, productData);

      getProductList(userUid); // Refresh the product list
      setIsEditing(false); // Exit editing mode
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const deleteProduct = async () => {
    try {
      if (tableId && !product.isNew && auth.currentUser?.uid) {
        await deleteDoc(
          doc(
            db,
            "users",
            auth.currentUser.uid,
            "tables",
            tableId,
            "products",
            product.id
          )
        );
      }
      setProductList((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <tr>
      {headers.map((header, idx) => (
        <td key={idx}>
          {isEditing ? (
            <input
              type="text"
              value={editedData[header] || ""}
              onChange={(e) => handleFieldChange(header, e.target.value)}
            />
          ) : (
            product[header]
          )}
        </td>
      ))}
      <td>
        <div style={{ display: "flex", gap: "5px" }}>
          <button
            onClick={() => (isEditing ? saveProduct() : setIsEditing(true))}
          >
            {isEditing ? "Save" : "Edit"}
          </button>
          <button onClick={deleteProduct}>Delete</button>
        </div>
      </td>
    </tr>
  );
}

export default Row;
