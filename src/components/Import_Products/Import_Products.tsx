import React, { useState } from "react";
import * as XLSX from "xlsx";

function Import_Products() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [items, setItems] = useState<any[]>([]);

  const readExcel = (file: File) => {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);

    fileReader.onload = (e: ProgressEvent<FileReader>) => {
      const bufferArray = e.target?.result as ArrayBuffer;

      const wb = XLSX.read(bufferArray, { type: "buffer" });

      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];

      // Convert the sheet to JSON where the first row is used as headers
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

      if (data.length > 0) {
        // The first row contains headers
        const fileHeaders = data[0];
        setHeaders(fileHeaders); // Store the headers

        // Slice the data to skip the first row (headers)
        const itemsData = data.slice(1).map((row) => {
          const rowData: any = {};
          fileHeaders.forEach((header: string, index: number) => {
            rowData[header] = row[index]; // Dynamically assign values
          });
          return rowData;
        });

        setItems(itemsData); // Store the rows of data
      }
    };

    fileReader.onerror = (error) => {
      console.error("Error reading file:", error);
    };
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
