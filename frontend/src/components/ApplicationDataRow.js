import React, { useState } from "react";
import styles from "../styles/ApplicationsList.module.css";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ApplicationDataRow = ({ api, index, onStatusChange }) => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEdit = () => {
    console.log("Edit API:", api);
    navigate(`/edit-application/${api._id}`);
  };

  const handleToggle = async () => {
    if (isUpdating) return; // Prevent multiple clicks
    setIsUpdating(true);
    try {
      const updatedApp = await axios.put(`/api/applications/${api._id}`, {
        enabled: !api.enabled,
      });
      onStatusChange(api._id, updatedApp.data.data.enabled);
    } catch (error) {
      console.error("Error toggle API:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <tr key={api._id} className={api.enabled ? "" : styles.disabledRow}>
      <td>{index}</td>
      <td>{`${api.applicationName} (${api.count_applications})`}</td>
      <td>{`${api.appName} (${api.count_apps})`}</td>
      <td>{api.applicationDescription || "N/A"}</td>
      <td>
        {(api.createdBy &&
          `${api.createdBy?.name} @${api.createdBy?.username}`) ||
          "Unknown"}
      </td>
      <td>
        {api.updatedBy && `${api.updatedBy?.name} @${api.updatedBy?.username})`}
      </td>
      <td className={styles.actionButtons}>
        <button
          className={styles.editButton}
          onClick={() => handleEdit()}
          disabled={isUpdating}
        >
          <FaEdit />
        </button>
        <input
          type="checkbox"
          checked={!!api.enabled}
          onChange={handleToggle}
          disabled={isUpdating}
        />
      </td>
    </tr>
  );
};

export default ApplicationDataRow;
