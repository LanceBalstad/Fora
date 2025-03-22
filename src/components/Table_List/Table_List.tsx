import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
import { auth, db } from "../../config/Firebase";
import { getTablesRef } from "../../utils/firestorePaths";

interface Table {
  id: string;
  tableName: string;
}

const Table_List_Page: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [newTableName, setNewTableName] = useState<string>("");
  const [isCreatingTable, setIsCreatingTable] = useState<boolean>(false); // Flag to control modal visibility
  const navigate = useNavigate();
  const userId = auth.currentUser?.uid;

  // Function to fetch tables from Firestore
  const fetchTables = async () => {
    if (userId) {
      const tablesRef = getTablesRef(userId);

      try {
        const querySnapshot = await getDocs(tablesRef);
        const tableList: Table[] = [];
        querySnapshot.forEach((docSnapshot) => {
          const tableData = docSnapshot.data();
          tableList.push({
            id: docSnapshot.id,
            tableName: tableData.tableName || "Unnamed Table",
          });
        });
        setTables(tableList);
      } catch (error) {
        console.error("Error fetching tables: ", error);
      }
    }
  };

  useEffect(() => {
    fetchTables(); // Fetch tables on component mount
  }, [userId]);

  const handleTableClick = (tableId: string) => {
    localStorage.setItem("activeTableId", tableId);
    navigate(`/product_list/${tableId}`);
  };

  const handleCreateTable = async () => {
    if (!newTableName.trim()) {
      alert("Table name is required!");
      return;
    }

    if (userId) {
      try {
        console.log("Creating new table with name:", newTableName); // Debug log
        // Add new table under the user's tables subcollection
        await addDoc(collection(db, "users", userId, "tables"), {
          tableName: newTableName,
        });

        // After the table is created, fetch the updated list of tables
        await fetchTables();

        setNewTableName("");
        setIsCreatingTable(false);
        console.log("Table created successfully"); // Debug log
      } catch (error) {
        console.error("Error creating table: ", error);
      }
    }
  };

  return (
    <div>
      <h1>Your Tables</h1>

      {tables.length === 0 ? (
        <p>No tables found. Create one to start adding products!</p>
      ) : (
        <ul>
          {tables.map((table) => (
            <li key={table.id}>
              <button onClick={() => handleTableClick(table.id)}>
                {table.tableName}
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => setIsCreatingTable(true)}
        className="add-table-button"
      >
        Add New Table
      </button>
      <div>here</div>
      {isCreatingTable && (
        <div className="modals">
          <div className="modal-content">
            <h2>Create a New Table</h2>
            <input
              type="text"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              placeholder="Enter table name"
            />
            <button onClick={handleCreateTable}>Create Table</button>
            <button onClick={() => setIsCreatingTable(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table_List_Page;
