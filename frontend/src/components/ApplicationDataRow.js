import React, { useState } from "react";
import styles from "../styles/ApplicationsList.module.css";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useModal } from "../context/ModalContext";

const ApplicationDataRow = ({ api, index, onStatusChange, isExpanded, onExpandToggle }) => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const { showModal } = useModal();

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


  const handleShowApis = async (applicationId, appName) => {
    try {
      const res = await axios.get(`/api/apis/application/${applicationId}`);
      const apis = res.data.data;
      console.log(apis);
      showModal(
        <div>
          <h3 style={{ marginBottom: "1rem" }}>
            APIs for <strong>{appName}</strong>
          </h3>
          {apis.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#dff0ff", textAlign: "left" }}>
                  <th style={{ padding: "8px", border: "1px solid #ccc" }}>
                    #
                  </th>
                  <th style={{ padding: "8px", border: "1px solid #ccc" }}>
                    Application Name
                  </th>
                  <th style={{ padding: "8px", border: "1px solid #ccc" }}>
                    Api Name
                  </th>
                  <th style={{ padding: "8px", border: "1px solid #ccc" }}>
                    Project
                  </th>
                  <th style={{ padding: "8px", border: "1px solid #ccc" }}>
                    Type
                  </th>
                  <th style={{ padding: "8px", border: "1px solid #ccc" }}>
                    Description
                  </th>
                  <th style={{ padding: "8px", border: "1px solid #ccc" }}>
                    Created By
                  </th>
                </tr>
              </thead>
              <tbody>
                {apis.map((api, index) => (
                  <tr key={api._id}>
                    <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                      {api.name || "—"}
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                      {api.application?.appName || "—"}
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                      {api.project?.name || "—"}
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                      {api.type || "—"}
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                      {api.apiDescription || "—"}
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                      {api.createdBy?.name} ({api.createdBy?.username})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No APIs found.</p>
          )}
        </div>
      );
      
    } catch (error) {
      console.error("Failed to fetch APIs for application", error);
    }
  };


  return (
    <>
      <tr
        key={api._id}
        className={api.enabled ? "" : styles.disabledRow}
        onClick={() => onExpandToggle(api._id)}
      >
        <td>{index}</td>
        <td>{`${api.projectname?.name}`}</td>
        <td>{`${api.appName}`}</td>
        <td>{api.applicationDescription || "N/A"}</td>
        <td>
          {(api.createdBy &&
            `${api.createdBy?.name} @${api.createdBy?.username}`) ||
            "Unknown"}
        </td>
        <td>
          {api.updatedBy &&
            `${api.updatedBy?.name} @${api.updatedBy?.username})`}
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
      {isExpanded && (
        <tr className={styles.expandedRow}>
          <td colSpan="7">
            <div
              style={{
                padding: "10px",
                background: "#f0f4ff",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={() => handleShowApis(api._id, api.appName)}
            >
              API count: {api.apiCount} APIs created for{" "}
              <strong>{api.appName}</strong> (Click to view)
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default ApplicationDataRow;
