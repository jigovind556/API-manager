import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "../styles/ApiChangeHistory.module.css"; // Import CSS module

const ApiChangeHistory = () => {
  const { id } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/apis/${id}/history`);
        if (!response.ok) throw new Error(response.message);

        const data = await response.json();
        setHistory(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id]);

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>API Change History</h2>

      {loading && <p className={styles.loading}>Loading history...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && history.length === 0 && (
        <p className={styles.noHistory}>No change history available.</p>
      )}

      {!loading && !error && history.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Updated By</th>
              <th>Updated At</th>
              <th>Changes</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry) => (
              <tr key={entry._id}>
                <td>{entry.updatedBy?.name}</td>
                <td>{new Date(entry.updatedAt).toLocaleString()}</td>
                <td>
                  <ul className={styles.changesList}>
                    {Object.entries(entry.changes).map(
                      ([key, change], index) => (
                        <li key={index} className={styles.changeItem}>
                          <strong>{key}:</strong> {change.old} → {change.new}
                        </li>
                      )
                    )}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ApiChangeHistory;
