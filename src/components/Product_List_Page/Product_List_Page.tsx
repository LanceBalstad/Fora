import React, { useEffect, useState } from "react";
import { auth } from "../../config/Firebase";
import { getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import OpenAI_Helper from "./OpenAI_Helper/OpenAI_Helper";
import Table from "./Table/Table";
import { useParams } from "react-router-dom";
import { getProductsRef } from "../../utils/firestorePaths";

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

  // Fetch products once user and tableId are both available
  useEffect(() => {
    const fetchProducts = async () => {
      if (!userUid || !tableId) return;

      try {
        const collectionRef = getProductsRef(userUid, tableId);

        const queriedData = query(
          collectionRef,
          where("userId", "==", userUid),
          where("tableId", "==", tableId)
        );

        const data = await getDocs(queriedData);
        const filteredData = data.docs.map((doc) => ({
          ...(doc.data() as Record<string, any>),
          id: doc.id,
        })) as Product[];

        setProductList(filteredData);

        // Update headers only if they are empty
        if (headers.length === 0) {
          const uniqueHeaders = Array.from(
            new Set(
              filteredData.flatMap((product) =>
                Object.keys(product).filter(
                  (key) => key !== "userId" && key !== "id" && key !== "tableId"
                )
              )
            )
          );

          setHeaders((prevHeaders) => [
            ...new Set([...prevHeaders, ...uniqueHeaders]),
          ]); // Preserve existing headers
        }
      } catch (err) {
        console.error("Error fetching product list:", err);
      }
    };

    fetchProducts();
  }, [userUid, tableId]);

  // Function to toggle OpenAI_Helper visibility
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
        getProductList={() => {
          if (userUid && tableId) {
            const collectionRef = getProductsRef(userUid, tableId);

            const reloadData = async () => {
              try {
                const queriedData = query(
                  collectionRef,
                  where("userId", "==", userUid),
                  where("tableId", "==", tableId)
                );
                const data = await getDocs(queriedData);
                const filteredData = data.docs.map((doc) => ({
                  ...(doc.data() as Record<string, any>),
                  id: doc.id,
                })) as Product[];
                setProductList(filteredData);
              } catch (err) {
                console.error("Error reloading product list:", err);
              }
            };
            reloadData();
          }
        }}
        tableId={tableId}
        toggleOpenAI={toggleOpenAI}
        showOpenAI={showOpenAI}
      />
    </>
  );
}

export default Product_List_Page;
