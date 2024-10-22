import "./App.css";
import Import_Products from "./components/Import_Products/Import_Products";

function App() {

  const logout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <>
      <div>App</div>
      <Import_Products />
      <div>here</div>
    </>
  );
}

export default App;
