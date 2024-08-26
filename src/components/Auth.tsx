import { auth, googleProvider } from "../config/Firebase";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";

export const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  console.log(auth.currentUser?.email);

  const signIn = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <section>
        <div className="form-box">
          <div className="forms">
            <h2>Login</h2>
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
            <button onClick={login}>Login to my account</button>
            <button onClick={signInWithGoogle}>Sign in with Google</button>
            <button onClick={logout}>Logout</button>
            <button onClick={signIn}>CA</button>
          </div>
        </div>
      </section>
    </>
    // <div>
    //   <input
    //     placeholder="Email..."
    //     onChange={(e) => setEmail(e.target.value)}
    //   />
    //   <input
    //     placeholder="Password..."
    //     type="password"
    //     onChange={(e) => setPassword(e.target.value)}
    //   />
    //   <button onClick={signIn}>Sign In</button>

    //   <button onClick={signInWithGoogle}>Sign in with Google</button>

    //   <button onClick={logout}>Logout</button>

    //   <button onClick={login}>Login</button>
    // </div>
  );
};
