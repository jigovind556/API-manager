import { useState } from "react";
import { FaEdit, FaTrash, FaHistory, FaFileAlt, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import styles from "../styles/SearchPage.module.css";

const DataRow = ({ api, index = "", onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleDeleteClick = () => {
    if (window.confirm("Are you sure you want to delete this API?")) {
      onDelete(api._id);
    }
  };

  const handleHistoryClick = () => {
    navigate(`/api-update-history/${api._id}`);
  };
  
  // const handleDownload = (file) => {
  //   window.open(`/${file}`, "_blank");
  // };
  const handleDownload = async (file) => {
    try {
      const response = await fetch(`/${file}`, {
        method: "GET",
      });

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


  return (
    <>
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
          {api.updatedBy &&
            `${api.updatedBy?.name} @${api.updatedBy?.username})`}
        </td>
        <td>
          {api.attachment?.length > 0 ? (
            <button
              className={styles.viewAttachmentsButton}
              onClick={() => setShowModal(true)}
            >
              View Attachments
            </button>
          ) : (
            "No Assets"
          )}
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

      {/* Modal for showing attachments */}
      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Attachments</h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className={styles.attachmentsGrid}>
              {api.attachment.map((file, i) =>
                file.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                  <div key={i} className={styles.attachmentItem}>
                    <img
                      src={`/${file}`}
                      alt="Attachment"
                      onClick={() => handleDownload(file)}
                      className={styles.attachmentImage}
                    />
                    <p>{file.split("/").pop()}</p>
                  </div>
                ) : (
                  <div key={i} className={styles.attachmentItem}>
                    <FaFileAlt className={styles.fileIcon} />
                    <div
                      onClick={() => handleDownload(file)}
                      href={`/${file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {file.split("/").pop()}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DataRow;
