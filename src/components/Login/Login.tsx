import "./Login.css";
import { auth, googleProvider } from "../../config/Firebase";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/table_list");
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // this will prevent page reload
    setLoginError(null);

    if (!email || !password) {
      setLoginError("Please enter both email and password");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/table_list");
    } catch (err) {
      console.error(err);

      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/user-not-found":
            setLoginError("No account found with this email");
            break;
          case "auth/invalid-email":
            setLoginError("Invalid email format");
            break;
          case "auth/invalid-credential":
            setLoginError("Invalid Credentials");
            break;
          default:
            setLoginError("Login failed. Please try agian");
        }
      } else {
        setLoginError("An unexpected error occurred");
      }
    }
  };

  return (
    <>
      <section>
        <div className="form-box">
          <div className="form">
            <h2>Login</h2>
            <div className="error">
              {loginError && <p className="error-message">{loginError}</p>}
            </div>
            <form onSubmit={handleLogin}>
              <div className="inputbox">
                <input
                  type="text"
                  placeholder="Email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label htmlFor="">Email Address</label>
              </div>
              <div className="inputbox">
                <input
                  type="password"
                  placeholder="Password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label htmlFor="">Password</label>
              </div>
              <button type="submit">Login to my account</button>
            </form>
            <button onClick={signInWithGoogle}>Sign in with Google</button>
            <span>Dont have an account? </span>
            <Link to="/create_account">Create Account</Link>
          </div>
        </div>
      </section>
    </>
  );
};
