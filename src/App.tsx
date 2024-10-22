import React from "react";
import "./App.css";
import { RouterProvider } from "react-router-dom";
import Import_Products from "./components/Import_Products/Import_Products";
import { Router } from "./Router";

function App() {
  return (
    <>
      <RouterProvider router={Router} />
      <Import_Products />
    </>
  );
}

export default App;
