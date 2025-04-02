import { collection, doc } from "firebase/firestore";
import { db } from "../config/Firebase";

export const getUserRef = (userId: string) => {
  return doc(db, "users", userId);
};

export const getProductsRef = (userId: string, tableId: string) => {
  return collection(db, "users", userId, "tables", tableId, "products");
};

export const getProductRef = (
  userId: string,
  tableId: string,
  productId: string
) => {
  return doc(db, "users", userId, "tables", tableId, "products", productId);
};

export const getColumnsRef = (userId: string, tableId: string) =>
  collection(db, "users", userId, "tables", tableId, "columns");


export const getTablesRef = (userId: string) => {
    return collection(db, "users", userId, "tables");
};

export const getTableRef = (userId: string, tableId: string) => {
  return doc(db, "users", userId, "tables", tableId);
};