import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/ApplicationsList.module.css";
import { FaSearch } from "react-icons/fa";
import ApplicationDataRow from "../components/ApplicationDataRow";

const ApplicationsList = () => {
  const [applications, setApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/applications", {
          withCredentials: true,
        });
        setApplications(response.data.data);
        setFilteredApplications(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch applications");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  useEffect(() => {
    const filtered = applications.filter(
      (app) =>
        app.applicationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.appName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredApplications(filtered);
  }, [searchQuery, applications]);

  const handleStatusChange = (id, enabled) => {
    setApplications((prevApps) =>
      prevApps.map((app) => (app._id === id ? { ...app, enabled } : app))
    );
  };

  return (
    <div className={styles.container}>
      <h2>Registered Applications</h2>

      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Search applications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <button className={styles.searchButton}>
          <FaSearch />
        </button>
      </div>

      {loading && <p>Loading applications...</p>}
      {error && <p className={styles.error}>{error}</p>}

      <table className={styles.apiTable}>
        <thead>
          <tr>
            <th>#</th>
            <th>Application Name</th>
            <th>App Name</th>
            <th>Description</th>
            <th>Created By</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredApplications.length > 0 ? (
            filteredApplications.map((app, index) => (
              <ApplicationDataRow
                key={app._id}
                api={app}
                index={index + 1}
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <tr>
              <td colSpan="7" className={styles.noData}>
                No applications found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicationsList;
