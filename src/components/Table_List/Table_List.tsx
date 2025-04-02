import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDocs, addDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../../config/Firebase";
import { getTablesRef, getTableRef } from "../../utils/firestorePaths";
import "./Table_List.css";

interface Table {
  id: string;
  tableName: string;
}

const Table_List_Page: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [newTableName, setNewTableName] = useState<string>("");
  const [isCreatingTable, setIsCreatingTable] = useState<boolean>(false);
  const navigate = useNavigate();
  const userId = auth.currentUser?.uid;

  const fetchTables = async () => {
    if (userId) {
      const tablesRef = getTablesRef(userId);
      try {
        const querySnapshot = await getDocs(tablesRef);
        const tableList: Table[] = querySnapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          tableName: docSnapshot.data().tableName || "Unnamed Table",
        }));
        setTables(tableList);
      } catch (error) {
        console.error("Error fetching tables: ", error);
      }
    }
  };

  useEffect(() => {
    fetchTables();
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
        await addDoc(getTablesRef(userId), {
          tableName: newTableName,
          userId: userId,
          columnsOrder: [],
        });

        await fetchTables();
        setNewTableName("");
        setIsCreatingTable(false);
      } catch (error) {
        console.error("Error creating table: ", error);
      }
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (
      window.confirm(
        "This will permanently delete the table and all its data. Are you sure you want to continue?"
      )
    ) {
      try {
        await deleteDoc(getTableRef(userId!, tableId));
        setTables(tables.filter((table) => table.id !== tableId));
      } catch (error) {
        console.error("Error deleting table: ", error);
      }
    }
  };

  return (
    <div className="table-list-container">
      <h1>Your Tables</h1>

      <button
        onClick={() => setIsCreatingTable(true)}
        className="add-table-button"
      >
        Add New Table
      </button>

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

      {tables.length === 0 ? (
        <p>No tables found...</p>
      ) : (
        <ul className="table-list">
          {tables.map((table) => (
            <li key={table.id} className="table-item">
              <button
                onClick={() => handleTableClick(table.id)}
                className="table-button"
              >
                {table.tableName}
              </button>
              <button
                onClick={() => handleDeleteTable(table.id)}
                className="delete-button"
              >
                ❌
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Table_List_Page;
