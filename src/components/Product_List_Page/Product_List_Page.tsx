import React, { useEffect, useState } from "react";
import { db, auth } from "../../config/Firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import OpenAI_Helper from "./OpenAI_Helper/OpenAI_Helper";
import Table from "./Table/Table";

interface Product {
  id: string;
  [key: string]: any;
}

function Product_List_Page() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const productsCollectionRef = collection(db, "products");

  const getProductList = async (userUid: string) => {
    try {
      const queriedData = query(
        productsCollectionRef,
        where("userId", "==", userUid)
      );
      const data = await getDocs(queriedData);

      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Product[];
      setProductList(filteredData);

      if (headers.length === 0) {
        const allHeaders = Array.from(
          new Set(
            filteredData.flatMap((product) =>
              Object.keys(product).filter(
                (key) => key !== "userId" && key !== "id"
              )
            )
          )
        );
        setHeaders(allHeaders);
      }
    } catch (err) {
      console.error("Error fetching product list:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) getProductList(user.uid);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <OpenAI_Helper productList={productList} columns={headers} />
      <Table
        productList={productList}
        setProductList={setProductList}
        headers={headers}
        getProductList={getProductList}
      />
    </>
  );
}

export default Product_List_Page;
