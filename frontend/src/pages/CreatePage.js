// CreatePage.js - Handles both create and edit functionality
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../styles/Create.module.css";
import { FaFileAlt, FaTrash } from "react-icons/fa";

const CreatePage = () => {
  const { id } = useParams(); // Get ID from URL if editing
  const isEditMode = !!id; // Check if we're in edit mode
  const navigate = useNavigate();
  const [applicationOptions, setApplicationOptions] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
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
    { name: "Other", val: "Other" },
  ];

  // Initial form data structure
  const initialFormData = {
    name: "",
    type: "Integration",
    environment: "",
    application: "--select-application--",
    project: "--select-project--",
    header: false,
    headerFields: [{name: "", description: ""}],
    endpoints: [
      {
        source: "",
        destination: "",
        portNo: "",
        appUrl: "",
        dnsName: "",
        // API specific fields
        httpType: "GET",
        apiUrl: "",
      },
    ],
    apiDescription: "",
    applicationDescription: "",
    request: "",
    response: "",
    attachments: [],
    existingAttachments: [], // Only used in edit mode
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Determine required fields based on type
  const getRequiredFields = (type) => {
    switch (type) {
      case "API":
        return [
          "httpType",
          "source",
          "destination",
          "portNo",
          "apiUrl",
          "dnsName",
        ];
      case "UI":
        return [ "appUrl"];
      case "Other":
        return [];  // No specific endpoint fields required for "Other" type
      case "Integration":
      default:
        return [
          "source",
          "destination",
          "portNo",
          "appUrl",
          "dnsName",
        ];
    }
  };

  useEffect(() => {
    const fetchOptionsAndData = async () => {
      setLoading(true);
      try {
        // Fetch applications and projects
        const [appResponse, projectResponse] = await Promise.all([
          axios.get("/api/applications/list", { withCredentials: true }),
          axios.get("/api/applicationOptions", { withCredentials: true }),
        ]);

        setApplicationOptions([
          {
            _id: "--select-application--",
            appName: "--select application--",
            projectname: "--select-application--",
          },
          ...appResponse.data.data,
        ]);

        setProjectOptions([
          { _id: "--select-project--", name: "--select project--" },
          ...projectResponse.data.data,
        ]);

        // If in edit mode, fetch the API data
        if (isEditMode) {
          const apiResponse = await axios.get(`/api/apis/${id}`, {
            withCredentials: true,
          });

          const apiData = apiResponse.data.data;
          const apiType = apiData.type || "Integration";

          setFormData({
            name: apiData.name || "",
            type: apiType,
            application: apiData.application._id || "--select-application--",
            project: apiData.project._id || "--select-project--",
            environment: apiData.environment || "",
            header: apiData.header || false,
            headerFields: apiData.headerFields || [{name: "", description: ""}],
            endpoints: apiData.endpoints || [
              {
                // Fields will be added based on type in useEffect
              },
            ],
            apiDescription: apiData.apiDescription || "",
            applicationDescription: apiData.applicationDescription || "",
            request: JSON.stringify(apiData.request || ""),
            response: JSON.stringify(apiData.response || ""),
            attachments: [],
            existingAttachments: apiData.attachment || [],
          });
        } else {
          // Initialize filtered applications for create mode
          setFilteredApplications([
            {
              _id: "--select-application--",
              appName: "--select application--",
              projectname: "--select-application--",
            },
          ]);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchOptionsAndData();
  }, [id, isEditMode]);

  useEffect(() => {
    // Filter applications when project changes
    if (formData.project === "--select-project--") {
      setFilteredApplications([
        {
          _id: "--select-application--",
          appName: "--select application--",
          projectname: "--select-application--",
        },
      ]);
    } else {
      const filtered = applicationOptions.filter(
        (app) =>
          app.projectname === formData.project ||
          app._id === "--select-application--"
      );
      setFilteredApplications(filtered);

      // Reset application selection if current selection is not in filtered list
      if (!filtered.find((app) => app._id === formData.application)) {
        setFormData((prev) => ({
          ...prev,
          application: "--select-application--",
        }));
      }
    }
  }, [formData.project, applicationOptions]);

  // Handle API type change
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFormData((prev) => ({
      ...prev,
      type: newType,
      // Reset header fields if type is UI or Other
      header: newType === "UI" || newType === "Other" ? false : prev.header,
      headerFields: newType === "UI" || newType === "Other" ? [] : prev.headerFields.length > 0 ? prev.headerFields : [{name: "", description: ""}],
      endpoints: newType === "Other" ? [] : prev.endpoints.map((endpoint) => ({
        ...endpoint,
        // Different defaults based on type
        ...(newType === "API" && {
          httpType: endpoint.httpType || "GET",
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
      })),
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
    // Don't add endpoints for "Other" type
    if (formData.type === "Other") {
      return;
    }
    
    // Create a new endpoint with the appropriate fields based on current type
    const newEndpoint = {
      // Include the default fields for the current type
      ...(formData.type === "API" && {
        httpType: "GET",
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
    if (isEditMode) {
      const updatedAttachments = [...formData.existingAttachments];
      updatedAttachments.splice(index, 1);
      setFormData({ ...formData, existingAttachments: updatedAttachments });
    }
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

  // Add a new header field
  const addHeaderField = () => {
    setFormData({
      ...formData,
      headerFields: [
        ...formData.headerFields,
        { name: "", description: "" }
      ]
    });
  };

  // Handle changes to header fields
  const handleHeaderFieldChange = (index, field, value) => {
    const updatedHeaderFields = [...formData.headerFields];
    updatedHeaderFields[index][field] = value;
    setFormData({
      ...formData,
      headerFields: updatedHeaderFields
    });
  };

  // Remove a header field
  const removeHeaderField = (index) => {
    // Ensure at least one header field remains
    if (formData.headerFields.length <= 1) {
      setFormData({
        ...formData,
        headerFields: [{ name: "", description: "" }]
      });
      return;
    }
    const updatedHeaderFields = formData.headerFields.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      headerFields: updatedHeaderFields
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Special handling for "Other" type
      if (formData.type === "Other") {
        if (!formData.name || !formData.apiDescription) {
          throw new Error("Name and Description are required for 'Other' type");
        }
      } else {
        // Validate that all required fields are present based on type
        const requiredFields = getRequiredFields(formData.type);

        for (let index = 0; index < formData.endpoints.length; index++) {
          const endpoint = formData.endpoints[index];
          for (const field of requiredFields) {
            if (!endpoint[field]) {
              throw new Error(
                `Endpoint ${index + 1} is missing required field: ${field}`
              );
            }
          }
        }
      }

      // Validate header fields if header is true and type is API
      if (formData.type === "API" && formData.header) {
        if (formData.headerFields.length === 0) {
          throw new Error("At least one header field is required when header is enabled");
        }
        
        for (let i = 0; i < formData.headerFields.length; i++) {
          const field = formData.headerFields[i];
          if (!field.name.trim()) {
            throw new Error(`Header field ${i + 1} is missing a name`);
          }
          if (!field.description.trim()) {
            throw new Error(`Header field ${i + 1} is missing a description`);
          }
        }
      }

      const formDataToSend = new FormData();

      // Add non-endpoint data
      formDataToSend.append("name", formData.name);
      formDataToSend.append("type", formData.type);
      
      // For all types, add environment, project and application
      formDataToSend.append("environment", formData.environment);
      formDataToSend.append("application", formData.application);
      formDataToSend.append("project", formData.project);
      formDataToSend.append("apiDescription", formData.apiDescription);
      
      // For "Other" type, we don't need additional fields
      if (formData.type !== "Other") {
        formDataToSend.append(
          "applicationDescription",
          formData.applicationDescription
        );
        formDataToSend.append("request", formData.request);
        formDataToSend.append("response", formData.response);
      }
      
      // Add header and headerFields only if type is API
      if (formData.type === "API") {
        formDataToSend.append("header", formData.header);
        if (formData.header) {
          formDataToSend.append("headerFields", JSON.stringify(formData.headerFields));
        }
      }

      // Add only the fields relevant to the selected type for each endpoint
      if (formData.type !== "Other") {
        formData.endpoints.forEach((endpoint, index) => {
          if (formData.type === "API") {
            formDataToSend.append(
              `endpoints[${index}][httpType]`,
              endpoint.httpType || "GET"
            );
            formDataToSend.append(
              `endpoints[${index}][source]`,
              endpoint.source || ""
            );
            formDataToSend.append(
              `endpoints[${index}][destination]`,
              endpoint.destination || ""
            );
            formDataToSend.append(
              `endpoints[${index}][portNo]`,
              endpoint.portNo || ""
            );
            formDataToSend.append(
              `endpoints[${index}][apiUrl]`,
              endpoint.apiUrl || ""
            );
            formDataToSend.append(
              `endpoints[${index}][dnsName]`,
              endpoint.dnsName || ""
            );
          } else if (formData.type === "UI") {
            formDataToSend.append(
              `endpoints[${index}][appUrl]`,
              endpoint.appUrl || ""
            );
          } else if (formData.type === "Integration") {
            formDataToSend.append(
              `endpoints[${index}][source]`,
              endpoint.source || ""
            );
            formDataToSend.append(
              `endpoints[${index}][destination]`,
              endpoint.destination || ""
            );
            formDataToSend.append(
              `endpoints[${index}][portNo]`,
              endpoint.portNo || ""
            );
            formDataToSend.append(
              `endpoints[${index}][appUrl]`,
              endpoint.appUrl || ""
            );
            formDataToSend.append(
              `endpoints[${index}][dnsName]`,
              endpoint.dnsName || ""
            );
          }
        });
      }

      // If in edit mode, include existing attachments
      if (isEditMode) {
        formData.existingAttachments.forEach((attachment, index) => {
          formDataToSend.append(`existingAttachments[${index}]`, attachment);
        });
      }

      // Add new attachments
      formData.attachments.forEach((file) => {
        formDataToSend.append("attachments", file);
      });

      // Use different API endpoints for create vs edit
      if (isEditMode) {
        await axios.put(`/api/apis/${id}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
        alert("API Updated Successfully!");
      } else {
        await axios.post("/api/apis", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
        alert("API Created Successfully!");
      }

      navigate("/search-api");
    } catch (err) {
      let errorMessage = `Failed to ${isEditMode ? "update" : "create"} API`;
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

  // Render header fields section
  const renderHeaderFieldsSection = () => {
    if ((formData.type !== "API" && formData.type !== "Integration") || !formData.header) return null;
    
    return (
      <div className={styles.headerFieldsSection}>
        <h3>Header Fields</h3>
        {formData.headerFields.length === 0 && (
          <div className={styles.noFieldsMessage}>
            No header fields added. Please add at least one header field.
          </div>
        )}
        
        {formData.headerFields.map((field, index) => (
          <div key={index} className={styles.headerFieldRow}>
            <input
              type="text"
              placeholder="Field Name"
              value={field.name}
              onChange={(e) => handleHeaderFieldChange(index, "name", e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Field Description"
              value={field.description}
              onChange={(e) => handleHeaderFieldChange(index, "description", e.target.value)}
              required
            />
            <button 
              type="button" 
              onClick={() => removeHeaderField(index)}
              // className={styles.removeButton}
            >
              Remove
            </button>
          </div>
        ))}
        
        <button 
          type="button" 
          onClick={addHeaderField}
          className={styles.addButton}
        >
          Add Header Field
        </button>
      </div>
    );
  };

  // Render endpoint fields based on selected type
  const renderEndpointFields = (endpoint, index) => {
    switch (formData.type) {
      case "API":
        return (
          <>
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
      <h2>{isEditMode ? "Edit API" : "Create API"}</h2>
      {error && <p className={styles.error}>{error}</p>}
      {loading && <p className={styles.loading}>Loading data...</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.dataRow}>
          <input
            type="text"
            name="name"
            placeholder="API Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className={styles.textInput}
          />
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
            name="environment"
            className={styles.select}
            value={formData.environment}
            onChange={handleSelectChange}
            required
          >
            <option value="">Select Environment</option>
            {envOptions.map((env) => (
              <option key={env.val} value={env.val}>
                {env.name}
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
          <select
            name="application"
            value={formData.application}
            onChange={handleSelectChange}
            required
            className={styles.select}
          >
            {filteredApplications.map((option) => (
              <option key={option._id} value={option._id}>
                {option.appName}
              </option>
            ))}
          </select>
        </div>

        {formData.type === "Other" ? (
          <div className={styles.descRow}>
            <textarea
              name="apiDescription"
              placeholder="Description"
              value={formData.apiDescription}
              onChange={(e) =>
                setFormData({ ...formData, apiDescription: e.target.value })
              }
              required
              style={{ width: '100%', height: '150px' }}
            ></textarea>
          </div>
        ) : (
          <>
            {(formData.type === "API" || formData.type === "Integration") && (
              <div className={styles.headerCheckboxSection}>
                <div className={styles.checkboxContainer}>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.header}
                      onChange={(e) => setFormData({ ...formData, header: e.target.checked })}
                    />
                    Enable API Header
                  </label>
                </div>
              </div>
            )}

            {renderHeaderFieldsSection()}

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
                <button type="button" onClick={() => removeEndpoint(index)}>
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addEndpoint}
              className={styles.addButton}
            >
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

            <div className={styles.descRow}>
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
          </>
        )}

        {isEditMode && formData.existingAttachments.length > 0 && formData.type !== "Other" && (
          <div className={styles.attachmentsSection}>
            <h3>Existing Attachments</h3>
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
        )}

        <div className={styles.fileUploadSection}>
          <h3>{isEditMode ? "Add New Attachments" : "Attachments"}</h3>
          <input
            type="file"
            name="attachment"
            accept="*"
            multiple
            onChange={handleFileChange}
          />
          {formData.attachments.length > 0 && (
            <div className={styles.newAttachments}>
              <h4>Files to Upload:</h4>
              {formData.attachments.map((file, index) => (
                <div key={index} className={styles.newAttachmentItem}>
                  <FaFileAlt className={styles.fileIcon} />
                  <span>{file.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
        >
          {loading
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
            ? "Update API"
            : "Create API"}
        </button>
      </form>
    </div>
  );
};

export default CreatePage;
