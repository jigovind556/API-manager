import { useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Login.module.css";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useUser();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await login(username, password);
    if (response.success) {
      navigate("/");
    } else {
      alert(response.message);
    }
  };

  return (
    // <div className={styles.container}>
    //   <h2>Login</h2>
    //   <form onSubmit={handleLogin} className={styles.form}>
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
    //     <button type="submit">Login</button>
    //     <p>
    //       Don't have an account? <a href="/register">Register</a>
    //     </p>
    //   </form>
    // </div>

    <section className={styles.loginSection}>
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <div className={styles.loginContent}>
            <h1 className={styles.loginTitle}>Login to your account</h1>
           
            <form onSubmit={handleLogin} className={styles.loginForm}>
              <div className={styles.formGroup}>
                <label htmlFor="username" className={styles.formLabel}>
                  Your Username
                </label>

                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.formLabel}>
                  Password
                </label>
                <div className={styles.passwordWrapper}>
                  <input
                    className={styles.formInput}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.registerLink}>
               
                <p className={styles.registerTitle}>
                   Don't have an account? <a className={styles.registerText} href="/register">Register</a>
                 
                </p>
              </div>

              <div className={styles.formAction}>
                <button type="submit" className={styles.loginButton}>
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
