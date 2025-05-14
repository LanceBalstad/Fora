import React, { useEffect, useState } from "react";
import {
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  writeBatch,
  deleteField,
  updateDoc,
  getDoc, // import getDoc to fetch the table document
} from "firebase/firestore";
import { db, auth } from "../../../../config/Firebase";
import {
  getColumnsRef,
  getProductsRef,
  getTableRef,
} from "../../../../utils/firestorePaths";
import "./Columns.css";

// dnd-kit imports
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Define prop types for SortableHeader
interface SortableHeaderProps {
  id: string;
  header: string;
  deleteColumn: (header: string) => void;
}

// A sortable header cell component
function SortableHeader({ id, header, deleteColumn }: SortableHeaderProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="column-header"
    >
      <div className="column-header-content">
        <button
          onClick={() => deleteColumn(header)}
          className="delete-column-btn"
        >
          ✕
        </button>
        <span className="column-name">{header}</span>
      </div>
    </th>
  );
}

interface ColumnsProps {
  headers: string[];
  setHeaders: React.Dispatch<React.SetStateAction<string[]>>;
  tableId: string;
}

function Columns({ headers, setHeaders, tableId }: ColumnsProps) {
  const [newColumn, setNewColumn] = useState("");

  // Sensors for drag events
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Modified fetchColumns function to apply order from table document
  const fetchColumns = async () => {
    const userUid = auth.currentUser?.uid;
    if (!userUid || !tableId) return;

    // Fetch all columns from the columns collection
    const colRef = getColumnsRef(userUid, tableId);
    const colDocsSnap = await getDocs(colRef);
    const fetchedColumns: string[] = colDocsSnap.docs.map(
      (doc) => doc.data().name
    );

    // Fetch the table document to get columnsOrder
    const tableRef = getTableRef(userUid, tableId);
    const tableSnap = await getDoc(tableRef);
    const columnsOrder: string[] = tableSnap.exists()
      ? tableSnap.data().columnsOrder || []
      : [];

    // Merge the two arrays: preserve order for columns in columnsOrder and append any new columns.
    const orderedColumns: string[] = [];
    // Add columns that exist in columnsOrder in that order.
    columnsOrder.forEach((colName) => {
      if (fetchedColumns.includes(colName)) {
        orderedColumns.push(colName);
      }
    });
    // Append any fetched columns that aren't in the stored order.
    fetchedColumns.forEach((colName) => {
      if (!orderedColumns.includes(colName)) {
        orderedColumns.push(colName);
      }
    });

    // Set the headers state to this ordered array.
    setHeaders(orderedColumns);
  };

  // Add a new column to Firestore and update the state
  const addColumn = async () => {
    if (!newColumn.trim()) return;
    const userUid = auth.currentUser?.uid;
    if (!userUid || !tableId) return;
    const colRef = getColumnsRef(userUid, tableId);

    // Add the new column to the columns collection
    await addDoc(colRef, { name: newColumn.trim(), userId: userUid });

    // Append the new column name to the table's columnsOrder field
    const tableRef = getTableRef(userUid, tableId);
    await updateDoc(tableRef, {
      columnsOrder: [...(headers || []), newColumn.trim()],
    });

    setNewColumn("");
    fetchColumns();
  };

  // Delete a column and update Firestore as well as product data
  const deleteColumn = async (nameToDelete: string) => {
    const userUid = auth.currentUser?.uid;
    if (!userUid || !tableId) return;
    const colRef = getColumnsRef(userUid, tableId);
    const snapshot = await getDocs(colRef);
    const match = snapshot.docs.find((doc) => doc.data().name === nameToDelete);
    if (match) {
      const productsRef = getProductsRef(userUid, tableId);
      const productsSnap = await getDocs(productsRef);
      // Check if any product has data in the column
      const hasData = productsSnap.docs.some((productDoc) => {
        const data = productDoc.data();
        return data.hasOwnProperty(nameToDelete) && data[nameToDelete] !== "";
      });
      if (hasData) {
        const confirmDelete = window.confirm(
          `The column "${nameToDelete}" contains data in some products. This data will be permanently deleted. Are you sure you want to continue?`
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

      // Also update the table's columnsOrder field to remove the deleted column.
      const tableRef = getTableRef(userUid, tableId);
      const tableSnap = await getDoc(tableRef);
      const columnsOrder: string[] = tableSnap.exists()
        ? tableSnap.data().columnsOrder || []
        : [];
      const newOrder = columnsOrder.filter((col) => col !== nameToDelete);
      await updateDoc(tableRef, { columnsOrder: newOrder });

      fetchColumns();
    }
  };

  // Update Firestore with the new order of columns
  const updateColumnOrderInFirestore = async (newOrder: string[]) => {
    const userUid = auth.currentUser?.uid;
    if (!userUid || !tableId) return;
    const tableRef = getTableRef(userUid, tableId);
    await updateDoc(tableRef, { columnsOrder: newOrder });
  };

  // Handle the drag end event to reorder columns
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = headers.indexOf(active.id as string);
      const newIndex = headers.indexOf(over.id as string);
      const newOrder = arrayMove(headers, oldIndex, newIndex);
      setHeaders(newOrder);
      // Persist the new order to Firestore
      updateColumnOrderInFirestore(newOrder);
    }
  };

  useEffect(() => {
    fetchColumns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId]);

  return (
    <thead className="thead-light">
      <tr>
        {/* Leftmost header cell for new header input */}
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
        {/* Wrap header cells in a drag-and-drop context */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={headers}
            strategy={verticalListSortingStrategy}
          >
            {headers.map((header) => (
              <SortableHeader
                key={header}
                id={header}
                header={header}
                deleteColumn={deleteColumn}
              />
            ))}
          </SortableContext>
        </DndContext>
      </tr>
    </thead>
  );
}

export default Columns;
