import "./App.css";

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
      <button onClick={logout}>Logout</button>
    </>
  );
}

export default App;
