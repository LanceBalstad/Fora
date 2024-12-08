import Navbar from "../components/Navbar/Navbar";

const Layout = ({ children }: { children: JSX.Element }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};
export default Layout;