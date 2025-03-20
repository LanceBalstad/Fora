import React, { useState } from "react";
import {
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
} from "firebase/firestore";
import { auth, db } from "../../../../config/Firebase";

interface Product {
  id: string;
  [key: string]: any;
}

interface RowProps {
  product: Product;
  headers: string[];
  setProductList: React.Dispatch<React.SetStateAction<Product[]>>;
  getProductList: (userUid: string) => void;
}

function Row({ product, headers, setProductList, getProductList }: RowProps) {
  const [isEditing, setIsEditing] = useState(product.id === "new");
  const [editedData, setEditedData] = useState<Product>(product);

  const handleFieldChange = (field: string, value: string) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  // save and edit handler. Clicking edit simply makes columns in product editable.
  const saveProduct = async () => {
    const userUid = auth.currentUser?.uid;
    if (!userUid) return;
    try {
      if (product.id === "new") {
        const { id, ...data } = editedData;
        await addDoc(collection(db, "products"), { ...data, userId: userUid });
      } else {
        await updateDoc(doc(db, "products", product.id), editedData);
      }
      getProductList(userUid);
      setIsEditing(false);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const deleteProduct = async () => {
    try {
      await deleteDoc(doc(db, "products", product.id));
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
          {product.id !== "new" && (
            <button onClick={deleteProduct}>Delete</button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default Row;
