import { useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Login.module.css";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { register } = useUser();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const response = await register(name, username, password);
    if (response.success) {
      navigate("/");
    } else {
      alert(response.message);
    }
  };

  return (
    // <div className={styles.container}>
    //   <h2>Register</h2>
    //   <form onSubmit={handleRegister} className={styles.form}>
    //     <input
    //       type="text"
    //       placeholder="Full Name"
    //       value={name}
    //       onChange={(e) => setName(e.target.value)}
    //       required
    //     />
    //     <input
    //       type="text"
    //       placeholder="Username"
    //       value={username}
    //       onChange={(e) => setUsername(e.target.value)}
    //       required
    //     />
    //     <input
    //       type="password"
    //       placeholder="Password"
    //       value={password}
    //       onChange={(e) => setPassword(e.target.value)}
    //       required
    //     />
    //     <button type="submit">Register</button>
    //     <p>
    //       Already have an account? <a href="/login">Login</a>
    //     </p>
    //   </form>
    // </div>

    <section className={styles.loginSection}>
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <div className={styles.loginContent}>
            <h1 className={styles.loginTitle}>Register</h1>
            <form onSubmit={handleRegister} className={styles.loginForm}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.formLabel}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.formInput}
                  placeholder="Full Name"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="username" className={styles.formLabel}>
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={styles.formInput}
                  placeholder="Username"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.formLabel}>
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.formInput}
                  placeholder="Password"
                  required
                />
              </div>

              <div className={styles.registerLink}>
                {/* <p>Already have an account? 
                <Link to="/login" className={styles.registerText}>Login</Link>
              </p> */}
                <p className={styles.registerTitle}>
                  Already have an account? <a className={styles.registerText} href="/login">Login</a>
                </p>
              </div>

              <div className={styles.formAction}>
                <button type="submit" className={styles.loginButton}>
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegisterPage;
