import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "../styles/ApiChangeHistory.module.css"; // Import CSS module

const ApiChangeHistory = () => {
  const { id } = useParams();
  const [apiInfo, setApiInfo] = useState(null);
  const [historyDetails, setHistoryDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      if (!id) {
        setError("API ID is required");
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.get(`/api/apis/history/${id}`, {
          withCredentials: true
        });
        
        // Get the history logs
        const historyLogs = response.data.data;
        
        // Extract API info from the first log entry if available
        if (historyLogs.length > 0) {
          const firstLog = historyLogs[0];
          setApiInfo({
            projectName: firstLog.apiId?.project?.name || "Unknown Project",
            applicationName: firstLog.apiId?.application?.appName || "Unknown Application"
          });
          
          // Process each history entry into individual field changes
          const detailedChanges = [];
          
          historyLogs.forEach(entry => {
            const updatedBy = entry.updatedBy?.name || "Unknown";
            const updatedAt = new Date(entry.updatedAt).toLocaleString();
            
            // Iterate through each change and create a separate row for it
            Object.entries(entry.changes).forEach(([field, change]) => {
              detailedChanges.push({
                id: `${entry._id}-${field}`,
                projectName: entry.apiId?.project?.name || "Unknown Project",
                applicationName: entry.apiId?.application?.appName || "Unknown Application",
                fieldName: formatFieldName(field),
                oldValue: formatValue(change.old),
                newValue: formatValue(change.new),
                updatedBy,
                updatedAt
              });
            });
          });
          
          setHistoryDetails(detailedChanges);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id]);
  
  // Helper function to format field names for display
  const formatFieldName = (field) => {
    // Convert camelCase to Title Case with spaces
    const formatted = field.replace(/([A-Z])/g, ' $1')
                          .replace(/^./, str => str.toUpperCase());
    
    // Handle common abbreviations or custom formatting
    return formatted
      .replace("Api ", "API ")
      .replace("Url", "URL")
      .replace("Dns", "DNS");
  };
  
  // Helper function to format values
  const formatValue = (value) => {
    if (value === undefined || value === null) return "—";
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch (e) {
        return "Complex Object";
      }
    }
    if (value === "") return "(empty)";
    return String(value);
  };

  return (
    <div className={styles.container}>
      {apiInfo && (
        <h2 className={styles.heading}>
          Change History: {apiInfo.applicationName} ({apiInfo.projectName})
        </h2>
      )}
      {!apiInfo && <h2 className={styles.heading}>API Change History</h2>}

      {loading && <p className={styles.loading}>Loading history...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && historyDetails.length === 0 && (
        <p className={styles.noHistory}>No change history available for this API.</p>
      )}

      {!loading && !error && historyDetails.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Application Name</th>
              <th>Field Changed</th>
              <th>Old Value</th>
              <th>New Value</th>
              <th>Updated By</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {historyDetails.map((detail) => (
              <tr key={detail.id}>
                <td>{detail.projectName}</td>
                <td>{detail.applicationName}</td>
                <td>{detail.fieldName}</td>
                <td className={styles.valueCell}>{detail.oldValue}</td>
                <td className={styles.valueCell}>{detail.newValue}</td>
                <td>{detail.updatedBy}</td>
                <td>{detail.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ApiChangeHistory;
