import { FaEdit, FaTrash, FaHistory } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import styles from "../styles/SearchPage.module.css";

const DataRow = ({ api, index = "", onEdit, onDelete }) => {
  const navigate = useNavigate();

  const handleDeleteClick = () => {
    if (window.confirm("Are you sure you want to delete this API?")) {
      onDelete(api._id);
    }
  };

  const handleHistoryClick = () => {
    navigate(`/api-update-history/${api._id}`);
  };

  return (
    <tr>
      <td>{index}</td>
      <td>{api.application?.appName}</td>
      <td>{api.project?.name}</td>
      <td>{api.applicationDescription}</td>
      <td>{api.apiDescription}</td>
      <td>
        {api.createdBy?.name} (@{api.createdBy?.username})
      </td>
      <td>
        {api.updatedBy && `${api.updatedBy?.name} @${api.updatedBy?.username})`}
      </td>
      <td className={styles.actionButtons}>
        <button className={styles.editButton} onClick={() => onEdit(api)}>
          <FaEdit />
        </button>
        <button className={styles.deleteButton} onClick={handleDeleteClick}>
          <FaTrash />
        </button>
        <button className={styles.historyButton} onClick={handleHistoryClick}>
          <FaHistory />
        </button>
      </td>
    </tr>
  );
};

export default DataRow;
