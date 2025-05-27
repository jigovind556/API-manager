import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import styles from "../styles/Layout.module.css";

const Layout = ({ children }) => {
  const { user, logout ,loading} = useUser();
  const location = useLocation();

  if (!loading && !user) {
    // Redirect to login if user is not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className={styles.layout}>
      {/* Sidebar Navigation */}
      <nav className={styles.sidebar}>
        <h2 className={styles.title}>Dashboard</h2>
        <ul>
          <li className={styles.navbox}>
            <a href="/create-api">Create API</a>
          </li>
          <li className={styles.navbox}>
            <a href="/create-application">Create Application</a>
          </li>
          <li className={styles.navbox}>
            <a href="/search-api">Search API</a>
          </li>
          <li className={styles.navbox}>
            <a href="/api-history-summary">API update history</a>
          </li>
          <li className={styles.navbox}>
            <a href="/applications-search">Application Search</a>
          </li>
          <li>
            <button className={styles.logoutBtn} onClick={logout}>
              Logout
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default Layout;
