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
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // const [expanded, setExpanded] = useState(false);
  const {theme, toggleTheme} = useMyContext();
  // const ExpandMore = styled((props)=>{
  //   const {expand, ...other} = props;
  //   return <IconButton {...other}/>;
  // })(({theme})=>({
  //   marginLeft: 'auto',
  //   transition:theme.transitions.create('transform',{
  //     duration: theme.transitions.duration.shortest,
  //   }),
  //   variants: [
  //     {
  //       props: ({expand}) => !expand,
  //       style: {
  //         transform: 'rotate(0deg)',
  //       },
  //     },
  //     {
  //       props: ({expand}) => expand,
  //       style: {
  //         transform: 'rotate(180deg)',
  //       },
  //     }
  //   ],
  // }));

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
    api.application?.appName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container} style={{backgroundColor: theme === 'light' ? '#f0f0f0' : '#333', color: theme === 'light' ? '#333' : '#f0f0f0'}}>
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
            <th>Project Name</th>
            <th>Application desc</th>
            <th>Api desc </th>
            <th>Created By</th>
            <th>Updated By</th>
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
              <td colSpan="9">No APIs found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SearchPage;
