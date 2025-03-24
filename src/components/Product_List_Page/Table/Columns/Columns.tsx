import React, { useEffect, useState } from "react";
import { getDocs, deleteDoc, doc, addDoc, collection, writeBatch, deleteField } from "firebase/firestore";
import { db, auth } from "../../../../config/Firebase";
import { getColumnsCollectionRef } from "../../../../utils/firestorePaths";
import { getProductsCollectionRef } from "../../../../utils/firestorePaths";

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
      // Delete the column from Firestore
      await deleteDoc(doc(colRef, match.id));
  
      // Now, check and update the products
      const productsRef = getProductsCollectionRef(userUid, tableId)
      const productsSnap = await getDocs(productsRef);
      
      // Create a batch to perform multiple write operations
      const batch = writeBatch(db);
  
      // Loop through all products
      productsSnap.forEach((productDoc) => {
        const productData = productDoc.data();
        
        // Check if the product has a field matching the deleted column name
        if (productData.hasOwnProperty(nameToDelete)) {
          const productDocRef = doc(productsRef, productDoc.id);
          
          // Add the delete operation to the batch
          batch.update(productDocRef, { [nameToDelete]: deleteField() });
        }
      });
  
      // Commit the batch update to delete the field from products
      await batch.commit();
  
      // Fetch columns again after the deletion
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
          <th key={idx} style={{ position: "relative", paddingRight: "20px" }}>
            {header}
            <button
              onClick={() => deleteColumn(header)}
              style={{
                position: "absolute",
                top: "50%",
                right: "5px",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                color: "red",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              ✕
            </button>
          </th>
        ))}
        {/* Add Column Input & Button next to headers */}
        <th>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="text"
              placeholder="New Column Name"
              value={newColumn}
              onChange={(e) => setNewColumn(e.target.value)}
              style={{ flexGrow: 1, maxWidth: "120px" }}
            />
            <button onClick={addColumn}>+</button>
          </div>
        </th>
      </tr>
    </thead>
  );
}

export default Columns;
