import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/SearchPage.module.css"; // Importing module CSS

const SearchPage = () => {
  const [apis, setApis] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApis = async () => {
      try {
        const response = await axios.get("/api/apis", {
          withCredentials: true,
        });
        setApis(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch APIs");
      } finally {
        setLoading(false);
      }
    };
    fetchApis();
  }, []);

  // Filter APIs based on search query
  const filteredApis = apis.filter((api) =>
    api.applicationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <h2>Search APIs</h2>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by Application Name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={styles.searchInput}
      />

      {/* Loading & Error Handling */}
      {loading && <p>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {/* Display APIs */}
      <div className={styles.apiList}>
        {filteredApis.length > 0 ? (
          filteredApis.map((api) => (
            <div key={api._id} className={styles.apiCard}>
              <h3>{api.applicationName}</h3>
              <p>
                <strong>Source:</strong> {api.source}
              </p>
              <p>
                <strong>Destination:</strong> {api.destination}
              </p>
              <p>
                <strong>Created By:</strong> {api.createdBy?.name} (@
                {api.createdBy?.username})
              </p>
              <p>
                <strong>URL:</strong>{" "}
                <a href={api.appUrl} target="_blank" rel="noopener noreferrer">
                  {api.appUrl}
                </a>
              </p>
            </div>
          ))
        ) : (
          <p>No APIs found</p>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
