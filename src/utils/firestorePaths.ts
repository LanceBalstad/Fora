import { collection, doc } from "firebase/firestore";
import { db } from "../config/Firebase";


export const getProductsCollectionRef = (userId: string, tableId: string) => {
  return collection(db, "users", userId, "tables", tableId, "products");
};

export const getProductRef = (
  userId: string,
  tableId: string,
  productId: string
) => {
  return doc(db, "users", userId, "tables", tableId, "products", productId);
};

export const getTablesRef = (userId: string) => {
    return collection(db, "users", userId, "tables");
  };