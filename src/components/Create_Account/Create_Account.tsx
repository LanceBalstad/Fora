import { auth } from "../../config/Firebase";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, setDoc } from "firebase/firestore";
import { getUserRef } from "../../utils/firestorePaths";
import { FirebaseError } from "firebase/app";

const db = getFirestore();

function Create_Account() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const navigate = useNavigate();

  const createAccount = async () => {
    setCreateError(null);

    if (!email || !password) {
      setCreateError("Please enter both email and password");
      return;
    }

    try {
      // Create the user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const userId = userCredential.user.uid;

      // Write to Firestore
      await setDoc(getUserRef(userId), {
        email,
        createdAt: new Date(),
      });

      navigate("/table_list");
    } catch (err) {
      console.error("Error creating account:", err);

      if (err instanceof FirebaseError) {
        // Map the Firebase auth error codes to user‐friendly messages
        switch (err.code) {
          case "auth/email-already-in-use":
            setCreateError("This email is already in use");
            break;
          case "auth/invalid-email":
            setCreateError("Invalid email format");
            break;
          case "auth/weak-password":
            setCreateError("Password should be at least 6 characters");
            break;
          default:
            setCreateError("Failed to create account. Please try again");
        }
      } else {
        setCreateError("An unexpected error occurred");
      }
    }
  };

  return (
    <section>
      <div className="form-box">
        <div className="form">
          <h2>Create Account</h2>

          {/* Error display */}
          <div className="error-container">
            {createError && <p className="error-message">{createError}</p>}
          </div>

          <div className="inputbox">
            <input
              type="text"
              placeholder="Email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Email Address</label>
          </div>

          <div className="inputbox">
            <input
              type="password"
              placeholder="Password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Passwords</label>
          </div>

          <button onClick={createAccount}>Create Account</button>
          <Link to="/">Go Back to login</Link>
        </div>
      </div>
    </section>
  );
}

export default Create_Account;
