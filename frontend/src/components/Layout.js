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
        <h2>Dashboard</h2>
        <ul>
          <li>
            <a href="/create">Create</a>
          </li>
          <li>
            <a href="/search">Search</a>
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
