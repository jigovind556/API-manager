// SearchPage.js
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/SearchPage.module.css";
import { FaSearch } from "react-icons/fa";
import DataRow from "../components/DataRow";
import { useNavigate } from "react-router-dom";

const SearchPage = () => {
  const navigate = useNavigate();
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

  const filteredApis = apis.filter((api) =>
    api.applicationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <h2>Search APIs</h2>
      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Search by Application Name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <button className={styles.searchButton}>
          <FaSearch />
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}

      <table className={styles.apiTable}>
        <thead>
          <tr>
            <th>#</th>
            <th>Application Name</th>
            <th>Source</th>
            <th>Destination</th>
            <th>Created By</th>
            <th>Updated By</th>
            <th>URL</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredApis.length > 0 ? (
            filteredApis.map((api,index) => (
              <DataRow
                key={api._id}
                index={index+1}
                api={api}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <tr>
              <td colSpan="8">No APIs found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SearchPage;
