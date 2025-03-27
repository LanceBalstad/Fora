import React, { useEffect, useState } from "react";
import {
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  collection,
  writeBatch,
  deleteField,
} from "firebase/firestore";
import { db, auth } from "../../../../config/Firebase";
import {
  getColumnsCollectionRef,
  getProductsCollectionRef,
} from "../../../../utils/firestorePaths";
import "./Columns.css";

interface ColumnsProps {
  headers: string[];
  setHeaders: React.Dispatch<React.SetStateAction<string[]>>;
  tableId: string;
}

function Columns({ headers, setHeaders, tableId }: ColumnsProps) {
  const [newColumn, setNewColumn] = useState("");

  const fetchColumns = async () => {
    const userUid = auth.currentUser?.uid;
    if (!userUid || !tableId) return;

    const colRef = getColumnsCollectionRef(userUid, tableId);
    const docsSnap = await getDocs(colRef);
    const columnNames = docsSnap.docs.map((doc) => doc.data().name);
    setHeaders(columnNames);
  };

  const addColumn = async () => {
    if (!newColumn.trim()) return;
    const userUid = auth.currentUser?.uid;
    if (!userUid || !tableId) return;

    const colRef = getColumnsCollectionRef(userUid, tableId);
    await addDoc(colRef, { name: newColumn.trim(), userId: userUid });
    setNewColumn("");
    fetchColumns();
  };

  const deleteColumn = async (nameToDelete: string) => {
    const userUid = auth.currentUser?.uid;
    if (!userUid || !tableId) return;

    const colRef = getColumnsCollectionRef(userUid, tableId);
    const snapshot = await getDocs(colRef);
    const match = snapshot.docs.find((doc) => doc.data().name === nameToDelete);

    if (match) {
      const productsRef = getProductsCollectionRef(userUid, tableId);
      const productsSnap = await getDocs(productsRef);

      // Check if any product has a value in the column
      const hasData = productsSnap.docs.some(
        (productDoc) =>
          productDoc.data().hasOwnProperty(nameToDelete) &&
          productDoc.data()[nameToDelete] !== undefined &&
          productDoc.data()[nameToDelete] !== null &&
          productDoc.data()[nameToDelete] !== ""
      );

      if (hasData) {
        const confirmDelete = window.confirm(
          `The column "${nameToDelete}" contains data in some products. This data will be permanently deleted. Are you sure you want to delete it?`
        );
        if (!confirmDelete) return;
      }

      await deleteDoc(doc(colRef, match.id));

      const batch = writeBatch(db);
      productsSnap.forEach((productDoc) => {
        const productData = productDoc.data();
        if (productData.hasOwnProperty(nameToDelete)) {
          const productDocRef = doc(productsRef, productDoc.id);
          batch.update(productDocRef, { [nameToDelete]: deleteField() });
        }
      });

      await batch.commit();
      fetchColumns();
    }
  };

  useEffect(() => {
    fetchColumns();
  }, [tableId]);

  return (
    <thead className="thead-light">
      <tr>
        {headers.map((header, idx) => (
          <th key={idx} className="column-header">
            <div className="column-header-content">
              <button
                onClick={() => deleteColumn(header)}
                className="delete-column-btn"
              >
                ✕
              </button>
              <span>{header}</span>
            </div>
          </th>
        ))}
        <th>
          <div className="add-column-container">
            <input
              type="text"
              placeholder="New Header..."
              value={newColumn}
              onChange={(e) => setNewColumn(e.target.value)}
              className="add-column-input"
            />
            <button onClick={addColumn}>+</button>
          </div>
        </th>
      </tr>
    </thead>
  );
}

export default Columns;
