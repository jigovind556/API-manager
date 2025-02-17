import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/ApplicationsList.module.css";

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

  return (
    <div className={styles.container}>
      <h2>Registered Applications</h2>
      {error && <p className={styles.error}>{error}</p>}

      <input
        type="text"
        placeholder="Search applications..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={styles.searchBar}
      />

      {loading ? (
        <p>Loading applications...</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Application Name</th>
                <th>App Name</th>
                <th>Description</th>
                <th>Created By</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.length > 0 ? (
                filteredApplications.map((app, index) => (
                  <tr key={app._id}>
                    <td>{index + 1}</td>
                    <td>{app.applicationName}</td>
                    <td>{app.appName}</td>
                    <td>{app.applicationDescription || "N/A"}</td>
                    <td>{app.createdBy?.username || "Unknown"}</td>
                    <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className={styles.noData}>
                    No applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApplicationsList;
