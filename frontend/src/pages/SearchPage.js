// SearchPage.js
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/SearchPage.module.css";
import { FaSearch } from "react-icons/fa";
import DataRow from "../components/DataRow";
import { useNavigate } from "react-router-dom";
import { useMyContext } from "../context/MyContext";

const SearchPage = () => {
  const navigate = useNavigate();
  const [apis, setApis] = useState([]);
  const [searchQueries, setSearchQueries] = useState({
    application: "",
    project: "",
    environment: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {theme, toggleTheme} = useMyContext();
  
  useEffect(() => {
    const fetchApis = async () => {
      try {
        const response = await axios.get("/api/apis", {
          withCredentials: true,
        });
        console.log(response.data.data);
        setApis(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch APIs");
      } finally {
        setLoading(false);
      }
    };
    fetchApis();
  }, []);

  const handleEdit = (api) => {
    console.log("Edit API:", api);
    navigate(`/edit/${api._id}`);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/apis/${id}`, { withCredentials: true });
      setApis((prevApis) => prevApis.filter((api) => api._id !== id));
    } catch (err) {
      console.error("Error deleting API:", err);
    }
  };

  const handleSearchChange = (field, value) => {
    setSearchQueries(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredApis = apis.filter((api) => {
    const applicationMatch = api.application?.appName?.toLowerCase().includes(searchQueries.application.toLowerCase());
    const projectMatch = api.project?.name?.toLowerCase().includes(searchQueries.project.toLowerCase());
    const environmentMatch = api.environment?.toLowerCase().includes(searchQueries.environment.toLowerCase());
    
    return applicationMatch && projectMatch && environmentMatch;
  });

  return (
    <div
      className={styles.container}
      style={{
        backgroundColor: theme === "light" ? "#f0f0f0" : "#333",
        color: theme === "light" ? "#333" : "#f0f0f0",
      }}
    >
      <h2>Search APIs</h2>
      <div className={styles.searchContainer}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search by Application Name..."
            value={searchQueries.application}
            onChange={(e) => handleSearchChange("application", e.target.value)}
            className={styles.searchInput}
          />
          <FaSearch className={styles.searchIcon} />
        </div>
        
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search by Project Name..."
            value={searchQueries.project}
            onChange={(e) => handleSearchChange("project", e.target.value)}
            className={styles.searchInput}
          />
          <FaSearch className={styles.searchIcon} />
        </div>
        
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search by Environment..."
            value={searchQueries.environment}
            onChange={(e) => handleSearchChange("environment", e.target.value)}
            className={styles.searchInput}
          />
          <FaSearch className={styles.searchIcon} />
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}

      <table className={styles.apiTable}>
        <thead>
          <tr>
            <th>#</th>
            <th>Type</th>
            <th>Environment</th>
            <th>Application Name</th>
            <th>Project Name</th>
            <th>Application desc</th>
            <th>Api desc </th>
            <th>Created By</th>
            <th>Updated By</th>
            <th>Assets</th> 
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredApis.length > 0 ? (
            filteredApis.map((api, index) => (
              <DataRow
                key={api._id}
                index={index + 1}
                api={api}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <tr>
              <td colSpan="11">No APIs found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SearchPage;
