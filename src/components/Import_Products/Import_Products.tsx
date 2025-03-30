import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { auth } from "../../config/Firebase";
import { addDoc, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Loading_Screen from "../Loading_Screen/Loading_Screen";
import { getProductsRef, getColumnsRef } from "../../utils/firestorePaths";
import "./Import_Products.css";

interface Column {
  name: string;
}

function ImportProductsContainer() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const [tableId] = useState<string | null>(
    localStorage.getItem("activeTableId")
  );
  const [productsCollectionRef, setProductsCollectionRef] = useState<any>(null);
  const [columnsCollectionRef, setColumnsCollectionRef] = useState<any>(null);

  useEffect(() => {
    if (tableId) {
      const userUid = auth.currentUser?.uid;
      if (userUid) {
        const productRef = getProductsRef(userUid, tableId);
        const columnRef = getColumnsRef(userUid, tableId);
        setProductsCollectionRef(productRef);
        setColumnsCollectionRef(columnRef);
      } else {
        console.error("User is not authenticated");
      }
    } else {
      console.error("No tableId found in localStorage.");
    }
  }, [tableId]);

  const readExcel = (file: File) => {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);

    fileReader.onload = (e: ProgressEvent<FileReader>) => {
      const bufferArray = e.target?.result as ArrayBuffer;
      const wb = XLSX.read(bufferArray, { type: "buffer" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];

      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

      if (data.length > 0) {
        const fileHeaders = data[0];
        setHeaders(fileHeaders);

        const itemsData = data
          .slice(1)
          .map((row) => {
            const rowData: any = {};
            fileHeaders.forEach((header: string, index: number) => {
              rowData[header] = row[index];
            });
            return rowData;
          })
          .filter((rowData) => {
            return Object.values(rowData).some(
              (value) => value !== null && value !== undefined && value !== ""
            );
          });

        setItems(itemsData);
      }
    };

    fileReader.onerror = (error) => {
      console.error("Error reading file:", error);
    };
  };

  const updateColumnsInFirestore = async () => {
    const userId = auth.currentUser?.uid;

    if (!columnsCollectionRef) return;

    const existingColumnsSnap = await getDocs(columnsCollectionRef);
    const existingColumns = existingColumnsSnap.docs.map((doc) => {
      const columnData = doc.data() as Column;
      return columnData.name;
    });

    // Check and add missing columns to Firestore
    for (const header of headers) {
      if (!existingColumns.includes(header)) {
        await addDoc(columnsCollectionRef, { name: header, userId: userId });
      }
    }
  };

  const uploadItemsToDatabase = async () => {
    if (!productsCollectionRef || !columnsCollectionRef) {
      console.error("Collection reference is not yet available.");
      return;
    }

    try {
      setLoading(true);
      const userUid = auth.currentUser?.uid;
      if (!userUid) {
        console.error("User is not authenticated");
        setLoading(false);
        return;
      }

      // Update columns in Firestore if needed
      await updateColumnsInFirestore();

      // Upload products to Firestore
      for (const item of items) {
        const sanitizedItem = Object.fromEntries(
          Object.entries(item).filter(([_, value]) => value !== undefined)
        );

        await addDoc(productsCollectionRef, {
          ...sanitizedItem,
          userId: userUid,
          tableId: tableId,
        });
      }

      console.log("Items added to Firestore successfully!");
      navigate(`/product_list/${tableId}`);
    } catch (err) {
      console.error("Error adding items to Firestore:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="import-products-container">
      {loading && <Loading_Screen message="Uploading products..." />}
      <input
        id="fileInput"
        type="file"
        title="Upload a file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            readExcel(file);
          }
        }}
      />
      <button
        onClick={uploadItemsToDatabase}
        disabled={loading || items.length === 0}
      >
        Upload to Firestore
      </button>

      <div className="import-products-table-container">
        <table className="table">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th scope="col" key={index}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((header, index) => (
                  <td key={index}>{row[header]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ImportProductsContainer;
