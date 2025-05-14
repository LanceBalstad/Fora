import React, { useEffect, useState } from "react";
import { auth } from "../../config/Firebase";
import { onSnapshot, orderBy, query } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import OpenAI_Helper from "./OpenAI_Helper/OpenAI_Helper";
import Table from "./Table/Table";
import { useParams } from "react-router-dom";
import { getProductsRef, getTableRef } from "../../utils/firestorePaths";

interface Product {
  id: string;
  [key: string]: any;
}

function Product_List_Page() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const { tableId } = useParams();
  const [userUid, setUserUid] = useState<string | null>(null);
  const [showOpenAI, setShowOpenAI] = useState(false);

  // Watch authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserUid(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  // Listen to the table document’s columnsOrder for header ordering
  useEffect(() => {
    if (!userUid || !tableId) return;
    const tableRef = getTableRef(userUid, tableId);
    const unsub = onSnapshot(
      tableRef,
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        if (Array.isArray(data.columnsOrder)) {
          setHeaders(data.columnsOrder as string[]);
        }
      },
      console.error
    );
    return () => unsub();
  }, [userUid, tableId]);

  // Listen to products collection for real-time updates, sorted by dateCreated
  useEffect(() => {
    if (!userUid || !tableId) return;
    const productsRef = getProductsRef(userUid, tableId);
    const unsub = onSnapshot(
      query(productsRef, orderBy("dateCreated", "asc")),
      (snap) => {
        const updated = snap.docs.map((d) => ({
          ...(d.data() as any),
          id: d.id,
        }));
        setProductList(updated);
      },
      console.error
    );
    return () => unsub();
  }, [userUid, tableId]);

  // Toggle AI helper
  const toggleOpenAI = () => {
    setShowOpenAI((prev) => !prev);
  };

  return (
    <>
      {showOpenAI && (
        <OpenAI_Helper productList={productList} columns={headers} />
      )}
      <Table
        productList={productList}
        setProductList={setProductList}
        setHeaders={setHeaders}
        headers={headers}
        tableId={tableId}
        toggleOpenAI={toggleOpenAI}
        showOpenAI={showOpenAI}
      />
    </>
  );
}

export default Product_List_Page;
