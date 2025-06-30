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
    name: "",
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

  // const filteredApis = apis.filter((api) => {
  //   const nameMatch = api.name?.toLowerCase().includes(searchQueries.name.toLowerCase());
  //   const applicationMatch = api.application?.appName?.toLowerCase().includes(searchQueries.application.toLowerCase());
  //   const projectMatch = api.project?.name?.toLowerCase().includes(searchQueries.project.toLowerCase());
  //   const environmentMatch = api.environment?.toLowerCase().includes(searchQueries.environment.toLowerCase());
    
  //   return nameMatch && applicationMatch && projectMatch && environmentMatch;
  // });

  const filteredApis = apis.filter((api) => {
    const { name, application, project, environment } = searchQueries;

    // If all searchQueries are empty, return false to skip filtering (i.e., show no APIs)
    if (!name && !application && !project && !environment) {
      return false;
    }
    const nameMatch = api.name?.toLowerCase().includes(name.toLowerCase());
    if(api.type==="Other"){
      return nameMatch; // If type is "Other", only filter by name
    }
    const applicationMatch = api.application?.appName
    ?.toLowerCase()
    .includes(application.toLowerCase());
    const projectMatch = api.project?.name
    ?.toLowerCase()
    .includes(project.toLowerCase());
    const environmentMatch = api.environment
    ?.toLowerCase()
    .includes(environment.toLowerCase());
    
    console.log("api name :", api.name," ,name:",name," ,nameMatch:", nameMatch," ,final :", nameMatch && applicationMatch && projectMatch && environmentMatch);
    return nameMatch && applicationMatch && projectMatch && environmentMatch;
  });
  console.log(filteredApis);

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
            placeholder="Search by API Name..."
            value={searchQueries.name}
            onChange={(e) => handleSearchChange("name", e.target.value)}
            className={styles.searchInput}
          />
          <FaSearch className={styles.searchIcon} />
        </div>
        
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
            <th>Name</th>
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
              <td colSpan="12">No APIs found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SearchPage;
