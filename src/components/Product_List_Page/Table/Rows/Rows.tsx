import React, { useState } from "react";
import { updateDoc, deleteDoc, addDoc } from "firebase/firestore";
import { auth, db } from "../../../../config/Firebase";
import {
  getProductRef,
  getProductsRef,
} from "../../../../utils/firestorePaths";
import "./Rows.css";

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

function Rows({
  product,
  headers,
  setProductList,
  getProductList,
  tableId,
}: RowProps) {
  const [isEditing, setIsEditing] = useState(product.id === "new");
  const [editedData, setEditedData] = useState<Product>(product);

  const handleFieldChange = (field: string, value: string) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const saveProduct = async () => {
    const userUid = auth.currentUser?.uid;
    if (!userUid || !tableId) return;
    try {
      if (product.id === "new") {
        const { id, ...data } = editedData;
        const docRef = await addDoc(getProductsRef(userUid, tableId), {
          ...data,
          tableId,
          userId: userUid,
        });
        await updateDoc(docRef, { id: docRef.id });
      } else {
        const productData = { ...editedData, userId: userUid, tableId };
        const productRef = getProductRef(userUid, tableId, product.id);
        await updateDoc(productRef, productData);
      }
      getProductList(userUid);
      setIsEditing(false);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const deleteProduct = async () => {
    if (window.confirm("Are you sure you want to delete this row?")) {
      try {
        if (tableId && !product.isNew && auth.currentUser?.uid) {
          await deleteDoc(
            getProductRef(auth.currentUser.uid, tableId, product.id)
          );
        }
        setProductList((prev) => prev.filter((p) => p.id !== product.id));
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  return (
    <tr>
      {/* Action buttons in the leftmost cell with a fixed width */}
      <td className="action-cell">
        <div className="action-buttons-container">
          <button
            className="small-action-button"
            onClick={() => (isEditing ? saveProduct() : setIsEditing(true))}
          >
            {isEditing ? "Save" : "Edit"}
          </button>
          {!isEditing && (
            <button className="small-action-button" onClick={deleteProduct}>
              Delete
            </button>
          )}
        </div>
      </td>
      {/* Render a cell for each header */}
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
    </tr>
  );
}

export default Rows;
