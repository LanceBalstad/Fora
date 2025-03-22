import { auth } from "../../config/Firebase";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore"; // Import Firestore methods

const db = getFirestore(); // Get Firestore instance

function Create_Account() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const createAccount = async () => {
    try {
      // Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Get the user's UID after successful creation
      const userId = userCredential.user.uid;

      // Add the user to Firestore
      await setDoc(doc(db, "users", userId), {
        email: email,
        createdAt: new Date(),
        // Add any other fields you want to store here (e.g., name, profile information, etc.)
      });

      // Navigate to the table list page after creating the account
      navigate("/table_list");
    } catch (err) {
      console.error("Error creating account:", err);
    }
  };

  return (
    <>
      <section>
        <div className="form-box">
          <div className="form">
            <h2>Create Account</h2>
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
            <button onClick={createAccount}>Create Account</button>
            <Link to="/">Go Back to login</Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default Create_Account;
