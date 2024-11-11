import React, { useState } from "react";
import * as XLSX from "xlsx";
import { db, auth } from "../../config/Firebase";
import { addDoc, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // Import useNavigate

function Import_Products() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const navigate = useNavigate(); // Initialize navigate

  const productsCollectionRef = collection(db, "products");

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
  
        const itemsData = data.slice(1).map((row) => {
          const rowData: any = {};
          fileHeaders.forEach((header: string, index: number) => {
            rowData[header] = row[index];
          });
          return rowData;
        }).filter((rowData) => {
          // Only keep rows that have at least one non-empty field
          return Object.values(rowData).some(value => value !== null && value !== undefined && value !== "");
        });
  
        setItems(itemsData);
      }
    };
  
    fileReader.onerror = (error) => {
      console.error("Error reading file:", error);
    };
  };
  

  // const uploadItemsToDatabase = async () => {
  //   try {
  //     const userUid = auth.currentUser?.uid;
  //     if (!userUid) {
  //       console.error("User is not authenticated");
  //       return;
  //     }

  //     for (const item of items) {
  //       // Skip rows that are completely empty
  //       // if (Object.values(item).every(value => value === null || value === undefined || value === "")) {
  //       //   continue;
  //       // }

  //       console.log("adding products");
  //       await addDoc(productsCollectionRef, {
  //         ...item,
  //         userId: userUid,
  //       });
  //     }

  //     console.log("Items added to Firestore successfully!");
  //     navigate("/product_list"); // Redirect to Product List page
  //   } catch (err) {
  //     console.error("Error adding items to Firestore:", err);
  //   }
  // };

  const uploadItemsToDatabase = async () => {
    try {
      const userUid = auth.currentUser?.uid;
      if (!userUid) {
        console.error("User is not authenticated");
        return;
      }
  
      for (const item of items) {
        // Remove any undefined values from the item object
        const sanitizedItem = Object.fromEntries(
          Object.entries(item).filter(([_, value]) => value !== undefined)
        );
  
        await addDoc(productsCollectionRef, {
          ...sanitizedItem,
          userId: userUid,
        });
      }
  
      console.log("Items added to Firestore successfully!");
      navigate("/product_list"); // Redirect to Product List page
    } catch (err) {
      console.error("Error adding items to Firestore:", err);
    }
  };
  

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            readExcel(file);
          }
        }}
      />
      <button onClick={uploadItemsToDatabase}>Upload to Firestore</button>

      <table className="table container">
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
  );
}

export default Import_Products;
