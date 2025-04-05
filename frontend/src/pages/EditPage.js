import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../styles/Create.module.css";
import { FaFileAlt, FaTrash } from "react-icons/fa";

const EditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applicationOptions, setApplicationOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const envOptions = [
    { name: "Dev", val: "dev" },
    { name: "QA", val: "qa" },
    { name: "PreProd", val: "preprod" },
    { name: "Prod", val: "prod" },
  ];

  const [formData, setFormData] = useState({
    application: "--select--",
    project: "--select--",
    endpoints: [],
    apiDescription: "",
    applicationDescription: "",
    request: "",
    response: "",
    attachments: [],
    existingAttachments: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [apiResponse, appResponse, projectResponse] = await Promise.all([
          axios.get(`/api/apis/${id}`, { withCredentials: true }),
          axios.get("/api/applications/list", { withCredentials: true }),
          axios.get("/api/applicationOptions", { withCredentials: true }),
        ]);

        const apiData = apiResponse.data.data;
        setApplicationOptions([
          { _id: "--select--", appName: "--select--" },
          ...appResponse.data.data,
        ]);
        setProjectOptions([
          { _id: "--select--", name: "--select--" },
          ...projectResponse.data.data,
        ]);

        setFormData({
          application: apiData.application._id || "--select--",
          project: apiData.project._id || "--select--",
          endpoints: apiData.endpoints || [
            {
              environment: "",
              source: "",
              destination: "",
              portNo: "",
              appUrl: "",
              dnsName: "",
            },
          ],
          apiDescription: apiData.apiDescription || "",
          applicationDescription: apiData.applicationDescription || "",
          request: JSON.stringify(apiData.request || ""),
          response: JSON.stringify(apiData.response || ""),
          attachments: [],
          existingAttachments: apiData.attachment || [],
        });
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleChange = (e, index, field) => {
    const updatedEndpoints = [...formData.endpoints];
    updatedEndpoints[index][field] = e.target.value;
    setFormData({ ...formData, endpoints: updatedEndpoints });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, attachments: Array.from(e.target.files) });
  };

  const addEndpoint = () => {
    setFormData({
      ...formData,
      endpoints: [
        ...formData.endpoints,
        {
          environment: "",
          source: "",
          destination: "",
          portNo: "",
          appUrl: "",
          dnsName: "",
        },
      ],
    });
  };

  const removeEndpoint = (index) => {
    const updatedEndpoints = formData.endpoints.filter((_, i) => i !== index);
    setFormData({ ...formData, endpoints: updatedEndpoints });
  };

  const removeExistingAttachment = (index) => {
    const updatedAttachments = [...formData.existingAttachments];
    updatedAttachments.splice(index, 1);
    setFormData({ ...formData, existingAttachments: updatedAttachments });
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
      setError("Failed to download file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key !== "endpoints" && key !== "attachments" && key !== "existingAttachments") {
          formDataToSend.append(key, formData[key]);
        }
      });

      formData.endpoints.forEach((endpoint, index) => {
        Object.keys(endpoint).forEach((field) => {
          formDataToSend.append(
            `endpoints[${index}][${field}]`,
            endpoint[field]
          );
        });
      });

      formData.existingAttachments.forEach((attachment, index) => {
        formDataToSend.append(`existingAttachments[${index}]`, attachment);
      });

      formData.attachments.forEach((file) => {
        formDataToSend.append("attachments", file);
      });

      await axios.put(`/api/apis/${id}`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      alert("API Updated Successfully!");
      navigate("/search");
    } catch (err) {
      let errorMessage = "Failed to update API";
      if (err.response && err.response.data) {
        errorMessage = err.response.data.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Edit API</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.dataRow}>
          <select
            name="application"
            value={formData.application}
            onChange={handleSelectChange}
            required
            className={styles.select}
          >
            {applicationOptions.map((option) => (
              <option key={option._id} value={option._id}>
                {option.appName}
              </option>
            ))}
          </select>
          <select
            name="project"
            value={formData.project}
            onChange={handleSelectChange}
            required
            className={styles.select}
          >
            {projectOptions.map((option) => (
              <option key={option._id} value={option._id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        {formData.endpoints.map((endpoint, index) => (
          <div key={index} className={styles.endpointRow}>
            <select
              value={endpoint.environment}
              onChange={(e) => handleChange(e, index, "environment")}
              required
            >
              <option value="">Select Environment</option>
              {envOptions.map((env) => (
                <option key={env.val} value={env.val}>
                  {env.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Source"
              value={endpoint.source}
              onChange={(e) => handleChange(e, index, "source")}
              required
            />
            <input
              type="text"
              placeholder="Destination"
              value={endpoint.destination}
              onChange={(e) => handleChange(e, index, "destination")}
              required
            />
            <input
              type="number"
              placeholder="Port Number"
              value={endpoint.portNo}
              onChange={(e) => handleChange(e, index, "portNo")}
              required
            />
            <input
              type="text"
              placeholder="App URL"
              value={endpoint.appUrl}
              onChange={(e) => handleChange(e, index, "appUrl")}
              required
            />
            <input
              type="text"
              placeholder="DNS Name"
              value={endpoint.dnsName}
              onChange={(e) => handleChange(e, index, "dnsName")}
              required
            />
            <button type="button" onClick={() => removeEndpoint(index)}>
              Remove
            </button>
          </div>
        ))}

        <button type="button" onClick={addEndpoint}>
          Add Endpoint
        </button>

        <div className={styles.descRow}>
          <textarea
            name="apiDescription"
            placeholder="API Description (Optional)"
            value={formData.apiDescription}
            onChange={(e) =>
              setFormData({ ...formData, apiDescription: e.target.value })
            }
          ></textarea>
          <textarea
            name="applicationDescription"
            placeholder="Application Description (Optional)"
            value={formData.applicationDescription}
            onChange={(e) =>
              setFormData({
                ...formData,
                applicationDescription: e.target.value,
              })
            }
          ></textarea>
        </div>

        <div className={styles.dataRow}>
          <textarea
            name="request"
            placeholder="Request Data"
            value={formData.request}
            onChange={(e) =>
              setFormData({ ...formData, request: e.target.value })
            }
            required
          ></textarea>

          <textarea
            name="response"
            placeholder="Response Data"
            value={formData.response}
            onChange={(e) =>
              setFormData({ ...formData, response: e.target.value })
            }
            required
          ></textarea>
        </div>

        <div className={styles.attachmentsSection}>
          <h3>Attachments</h3>
          <div className={styles.attachmentsGrid}>
            {formData.existingAttachments.map((file, index) => (
              <div key={index} className={styles.attachmentItem}>
                {file.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                  <div onClick={() => handleDownload(file)}>
                    <img
                      src={`/${file}`}
                      alt="Attachment"
                      className={styles.attachmentImage}
                    />
                    <p>{file.split("/").pop()}</p>
                  </div>
                ) : (
                  <div onClick={() => handleDownload(file)}>
                    <FaFileAlt className={styles.fileIcon} />
                    <div className={styles.downloadLink}>
                      {file.split("/").pop()}
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeExistingAttachment(index)}
                  className={styles.removeButton}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.fileUploadSection}>
          <h3>Add New Attachments</h3>
          <input
            type="file"
            name="attachment"
            accept="*"
            multiple
            onChange={handleFileChange}
          />
          {formData.attachments.length > 0 && (
            <div className={styles.newAttachments}>
              <h4>New Files to Upload:</h4>
              {formData.attachments.map((file, index) => (
                <div key={index} className={styles.newAttachmentItem}>
                  <FaFileAlt className={styles.fileIcon} />
                  <span>{file.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update API"}
        </button>
      </form>
    </div>
  );
};

export default EditPage;
