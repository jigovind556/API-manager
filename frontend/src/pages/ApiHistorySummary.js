// ApiHistorySummary.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "../styles/ApiChangeHistory.module.css";

const ApiHistorySummary = () => {
  const [apiSummary, setApiSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApiSummary = async () => {
      try {
        const response = await axios.get("/api/apis/history-summary", {
          withCredentials: true,
        });
        setApiSummary(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch API history summary");
      } finally {
        setLoading(false);
      }
    };

    fetchApiSummary();
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>API Change History Summary</h2>

      {loading && <p className={styles.loading}>Loading summary...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && apiSummary.length === 0 && (
        <p className={styles.noHistory}>No API change history available.</p>
      )}

      {!loading && !error && apiSummary.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Project Name</th>
              <th>Application Name</th>
              <th>API Name</th>
              <th>Type</th>
              <th>Iterations</th>
            </tr>
          </thead>
          <tbody>
            {apiSummary.map((api, index) => (
              <tr key={api._id}>
                <td>{index + 1}</td>
                <td>{api.project?.name || "—"}</td>
                <td>{api.application?.appName || "—"}</td>
                <td>{api.name || "—"}</td>
                <td>{api.type || "—"}</td>
                <td>
                  <Link to={`/api-history/${api._id}`} className={styles.iterationLink}>
                    {api.iterationCount}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ApiHistorySummary;
