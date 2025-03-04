// DataRow.js
import styles from "../styles/SearchPage.module.css";
import { FaEdit, FaTrash } from "react-icons/fa";

const DataRow = ({ api,index="", onEdit, onDelete }) => {
    const handleDeleteClick = () => {
      if (window.confirm("Are you sure you want to delete this API?")) {
        onDelete(api._id);
      }
    };
  return (
    <tr>
      <td>{index}</td>
      <td>{api.applicationName}</td>
      <td>{api.environment}</td>
      <td>{api.sourceDestinationPorts?.source || api.source}</td>
      <td>{api.sourceDestinationPorts?.destination || api.destination}</td>
      <td>
        {api.createdBy?.name} (@{api.createdBy?.username})
      </td>
      <td>
        {api.updatedBy && `${api.updatedBy?.name} @${api.updatedBy?.username})`}
      </td>
      <td>
        <a href={api.appUrl} target="_blank" rel="noopener noreferrer">
          {api.appUrl}
        </a>
      </td>
      <td className={styles.actionButtons}>
        <button className={styles.editButton} onClick={() => onEdit(api)}>
          <FaEdit />
        </button>
        <button className={styles.deleteButton} onClick={handleDeleteClick}>
          <FaTrash />
        </button>
      </td>
    </tr>
  );
};

export default DataRow;
