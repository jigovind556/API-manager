import { FaEdit, FaTrash, FaHistory, FaFileAlt, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useModal } from "../context/ModalContext";
import styles from "../styles/SearchPage.module.css";

const DataRow = ({ api, index = "", onEdit, onDelete }) => {
  const navigate = useNavigate();
  const { showModal } = useModal();

  const handleDeleteClick = () => {
    if (window.confirm("Are you sure you want to delete this API?")) {
      onDelete(api._id);
    }
  };

  const handleHistoryClick = () => {
    navigate(`/api-update-history/${api._id}`);
  };

  const handleDownload = async (file) => {
    try {
      const response = await fetch(`/${file}`, { method: "GET" });

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const handleViewAttachments = () => {
    showModal(
      <div>
        <h3>Attachments</h3>
        <div className={styles.attachmentsGrid}>
          {api.attachment.map((file, i) =>
            file.match(/\.(jpeg|jpg|png|gif)$/i) ? (
              <div
                key={i}
                onClick={() => handleDownload(file)}
                className={styles.attachmentItem}
              >
                <img
                  src={`/${file}`}
                  alt="Attachment"
                  className={styles.attachmentImage}
                />
                <p>{file.split("/").pop()}</p>
              </div>
            ) : (
              <div
                key={i}
                onClick={() => handleDownload(file)}
                className={styles.attachmentItem}
              >
                <FaFileAlt className={styles.fileIcon} />
                <div className={styles.downloadLink}>
                  {file.split("/").pop()}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  const handleViewJson = (title, jsonData) => {
    showModal(
      <div>
        <h3>{title}</h3>
        <pre className={styles.jsonViewer}>
          {JSON.stringify(jsonData, null, 2)}
        </pre>
      </div>
    );
  };

  // Get badge class based on API type
  const getTypeBadgeClass = () => {
    switch (api.type) {
      case "API":
        return styles.typeBadgeApi;
      case "UI":
        return styles.typeBadgeUi;
      case "Integration":
        return styles.typeBadgeIntegration;
      default:
        return styles.typeBadgeIntegration;
    }
  };

  const handleEditClick = () => {
    onEdit(api);
  };

  return (
    <tr>
      <td>{index}</td>
      <td>{api.name}</td>
      <td>
        <span className={`${styles.typeBadge} ${getTypeBadgeClass()}`}>
          {api.type || "Integration"}
        </span>
      </td>
      <td>{api.environment || "N/A"}</td>
      <td>{api.application?.appName}</td>
      <td>{api.project?.name}</td>
      <td>{api.applicationDescription}</td>
      <td>{api.apiDescription}</td>
      <td>
        {api.createdBy?.name} (@{api.createdBy?.username})
      </td>
      <td>
        {api.updatedBy && `${api.updatedBy?.name} @${api.updatedBy?.username}`}
      </td>
      <td>
        {api.attachment?.length > 0 ? (
          <button
            className={styles.viewAttachmentsButton}
            onClick={handleViewAttachments}
          >
            View Attachments
          </button>
        ) : (
          "No Assets"
        )}
        <button
          className={styles.viewButton}
          onClick={() => handleViewJson("API Request", api.request)}
        >
          <FaEye /> View Request
        </button>
        <button
          className={styles.viewButton}
          onClick={() => handleViewJson("API Response", api.response)}
        >
          <FaEye /> View Response
        </button>
      </td>
      <td className={styles.actionButtons}>
        <button className={styles.editButton} onClick={handleEditClick}>
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
