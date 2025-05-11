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
  
  const httpTypeOptions = [
    { name: "GET", val: "GET" },
    { name: "POST", val: "POST" },
    { name: "PUT", val: "PUT" },
    { name: "DELETE", val: "DELETE" },
    { name: "PATCH", val: "PATCH" },
  ];
  
  const apiTypeOptions = [
    { name: "API", val: "API" },
    { name: "UI", val: "UI" },
    { name: "Integration", val: "Integration" },
  ];

  const [formData, setFormData] = useState({
    type: "Integration", // Default type
    application: "--select application--",
    project: "--select project--",
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

  // Determine required fields based on type
  const getRequiredFields = (type) => {
    switch (type) {
      case "API":
        return ["environment", "apiName", "httpType", "source", "destination", "portNo", "apiUrl", "dnsName"];
      case "UI":
        return ["environment", "appUrl"];
      case "Integration":
      default:
        return ["environment", "source", "destination", "portNo", "appUrl", "dnsName"];
    }
  };

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
          {
            _id: "--select-application--",
            appName: "--select application--",
            projectname: "--select application--",
          },
          ...appResponse.data.data,
        ]);
        setProjectOptions([
          {
            _id: "--select-application--",
            appName: "--select application--",
            projectname: "--select application--",
          },
          ...projectResponse.data.data,
        ]);

        // Set default values for type
        const apiType = apiData.type || "Integration";
        
        setFormData({
          type: apiType,
          application: apiData.application._id || "--select application--",
          project: apiData.project._id || "--select project--",
          endpoints: apiData.endpoints || [
            {
              environment: "",
              // Conditionally include fields based on type
              ...(apiType === "API" && {
                apiName: "",
                httpType: "GET",
                header: false,
                source: "",
                destination: "",
                portNo: "",
                apiUrl: "",
                dnsName: "",
              }),
              ...(apiType === "UI" && {
                appUrl: "",
              }),
              ...(apiType === "Integration" && {
                source: "",
                destination: "",
                portNo: "",
                appUrl: "",
                dnsName: "",
              }),
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

  // Handle API type change
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFormData(prev => ({
      ...prev,
      type: newType,
      endpoints: prev.endpoints.map(endpoint => ({
        ...endpoint,
        environment: endpoint.environment || "", // Keep existing values
        // Different defaults based on type
        ...(newType === "API" && {
          apiName: endpoint.apiName || "",
          httpType: endpoint.httpType || "GET",
          header: endpoint.header || false,
          source: endpoint.source || "",
          destination: endpoint.destination || "",
          portNo: endpoint.portNo || "",
          apiUrl: endpoint.apiUrl || "",
          dnsName: endpoint.dnsName || "",
        }),
        ...(newType === "UI" && {
          appUrl: endpoint.appUrl || "",
        }),
        ...(newType === "Integration" && {
          source: endpoint.source || "",
          destination: endpoint.destination || "",
          portNo: endpoint.portNo || "",
          appUrl: endpoint.appUrl || "",
          dnsName: endpoint.dnsName || "",
        }),
      }))
    }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleChange = (e, index, field) => {
    const updatedEndpoints = [...formData.endpoints];
    
    // Handle checkbox for header field
    const value = field === "header" ? e.target.checked : e.target.value;
    updatedEndpoints[index][field] = value;
    
    setFormData({ ...formData, endpoints: updatedEndpoints });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, attachments: Array.from(e.target.files) });
  };

  const addEndpoint = () => {
    // Create a new endpoint with the appropriate fields based on current type
    const newEndpoint = {
      environment: "",
      // Include the default fields for the current type
      ...(formData.type === "API" && {
        apiName: "",
        httpType: "GET",
        header: false,
        source: "",
        destination: "",
        portNo: "",
        apiUrl: "",
        dnsName: "",
      }),
      ...(formData.type === "UI" && {
        appUrl: "",
      }),
      ...(formData.type === "Integration" && {
        source: "",
        destination: "",
        portNo: "",
        appUrl: "",
        dnsName: "",
      }),
    };

    setFormData({
      ...formData,
      endpoints: [...formData.endpoints, newEndpoint],
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
      // Validate that all required fields are present based on type
      const requiredFields = getRequiredFields(formData.type);
      
      for (let index = 0; index < formData.endpoints.length; index++) {
        const endpoint = formData.endpoints[index];
        for (const field of requiredFields) {
          if (!endpoint[field] && field !== "header") { // header is a boolean, can be false
            throw new Error(`Endpoint ${index + 1} is missing required field: ${field}`);
          }
        }
      }
      
      const formDataToSend = new FormData();

      // Add non-endpoint data including type
      formDataToSend.append("type", formData.type);
      formDataToSend.append("application", formData.application);
      formDataToSend.append("project", formData.project);
      formDataToSend.append("apiDescription", formData.apiDescription);
      formDataToSend.append("applicationDescription", formData.applicationDescription);
      formDataToSend.append("request", formData.request);
      formDataToSend.append("response", formData.response);
      
      // Add only the fields relevant to the selected type for each endpoint
      formData.endpoints.forEach((endpoint, index) => {
        // Always include environment field
        formDataToSend.append(`endpoints[${index}][environment]`, endpoint.environment);
        
        if (formData.type === "API") {
          formDataToSend.append(`endpoints[${index}][apiName]`, endpoint.apiName || "");
          formDataToSend.append(`endpoints[${index}][httpType]`, endpoint.httpType || "GET");
          formDataToSend.append(`endpoints[${index}][header]`, endpoint.header || false);
          formDataToSend.append(`endpoints[${index}][source]`, endpoint.source || "");
          formDataToSend.append(`endpoints[${index}][destination]`, endpoint.destination || "");
          formDataToSend.append(`endpoints[${index}][portNo]`, endpoint.portNo || "");
          formDataToSend.append(`endpoints[${index}][apiUrl]`, endpoint.apiUrl || "");
          formDataToSend.append(`endpoints[${index}][dnsName]`, endpoint.dnsName || "");
        } 
        else if (formData.type === "UI") {
          formDataToSend.append(`endpoints[${index}][appUrl]`, endpoint.appUrl || "");
        }
        else if (formData.type === "Integration") {
          formDataToSend.append(`endpoints[${index}][source]`, endpoint.source || "");
          formDataToSend.append(`endpoints[${index}][destination]`, endpoint.destination || "");
          formDataToSend.append(`endpoints[${index}][portNo]`, endpoint.portNo || "");
          formDataToSend.append(`endpoints[${index}][appUrl]`, endpoint.appUrl || "");
          formDataToSend.append(`endpoints[${index}][dnsName]`, endpoint.dnsName || "");
        }
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
      navigate("/search-api");
    } catch (err) {
      let errorMessage = "Failed to update API";
      if (err.message && !err.response) {
        errorMessage = err.message;
      } else if (err.response && err.response.data) {
        errorMessage = err.response.data.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Render endpoint fields based on selected type
  const renderEndpointFields = (endpoint, index) => {
    switch (formData.type) {
      case "API":
        return (
          <>
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
              placeholder="API Name"
              value={endpoint.apiName || ""}
              onChange={(e) => handleChange(e, index, "apiName")}
              required
            />
            <select
              value={endpoint.httpType || "GET"}
              onChange={(e) => handleChange(e, index, "httpType")}
              required
            >
              {httpTypeOptions.map((type) => (
                <option key={type.val} value={type.val}>
                  {type.name}
                </option>
              ))}
            </select>
            <div className={styles.checkboxContainer}>
              <label>
                <input
                  type="checkbox"
                  checked={endpoint.header || false}
                  onChange={(e) => handleChange(e, index, "header")}
                />
                Header
              </label>
            </div>
            <input
              type="text"
              placeholder="Source"
              value={endpoint.source || ""}
              onChange={(e) => handleChange(e, index, "source")}
              required
            />
            <input
              type="text"
              placeholder="Destination"
              value={endpoint.destination || ""}
              onChange={(e) => handleChange(e, index, "destination")}
              required
            />
            <input
              type="number"
              placeholder="Port Number"
              value={endpoint.portNo || ""}
              onChange={(e) => handleChange(e, index, "portNo")}
              required
            />
            <input
              type="text"
              placeholder="API URL"
              value={endpoint.apiUrl || ""}
              onChange={(e) => handleChange(e, index, "apiUrl")}
              required
            />
            <input
              type="text"
              placeholder="DNS Name"
              value={endpoint.dnsName || ""}
              onChange={(e) => handleChange(e, index, "dnsName")}
              required
            />
          </>
        );
      case "UI":
        return (
          <>
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
              placeholder="App URL"
              value={endpoint.appUrl || ""}
              onChange={(e) => handleChange(e, index, "appUrl")}
              required
            />
          </>
        );
      case "Integration":
      default:
        return (
          <>
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
              value={endpoint.source || ""}
              onChange={(e) => handleChange(e, index, "source")}
              required
            />
            <input
              type="text"
              placeholder="Destination"
              value={endpoint.destination || ""}
              onChange={(e) => handleChange(e, index, "destination")}
              required
            />
            <input
              type="number"
              placeholder="Port Number"
              value={endpoint.portNo || ""}
              onChange={(e) => handleChange(e, index, "portNo")}
              required
            />
            <input
              type="text"
              placeholder="App URL"
              value={endpoint.appUrl || ""}
              onChange={(e) => handleChange(e, index, "appUrl")}
              required
            />
            <input
              type="text"
              placeholder="DNS Name"
              value={endpoint.dnsName || ""}
              onChange={(e) => handleChange(e, index, "dnsName")}
              required
            />
          </>
        );
    }
  };

  return (
    <div className={styles.container}>
      <h2>Edit API</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.dataRow}>
          <select
            name="type"
            value={formData.type}
            onChange={handleTypeChange}
            required
            className={styles.select}
          >
            {apiTypeOptions.map((option) => (
              <option key={option.val} value={option.val}>
                {option.name}
              </option>
            ))}
          </select>
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
          <div 
            key={index} 
            className={`${styles.endpointRow} ${
              formData.type === "API" 
                ? styles.apiEndpointRow 
                : formData.type === "UI" 
                  ? styles.uiEndpointRow 
                  : styles.integrationEndpointRow
            }`}
          >
            {renderEndpointFields(endpoint, index)}
            <button type="button" onClick={() => removeEndpoint(index)} >
              Remove
            </button>
          </div>
        ))}

        <button type="button" onClick={addEndpoint} className={styles.addButton}>
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

        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? "Updating..." : "Update API"}
        </button>
      </form>
    </div>
  );
};

export default EditPage;
