// createPage.js
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Create.module.css";

const CreatePage = () => {
  const navigate = useNavigate();
  const envOptions = [
    { name: "Dev", val: "dev" },
    { name: "QA", val: "qa" },
    { name: "PreProd", val: "preprod" },
    { name: "Prod", val: "prod" },
  ];

  const [formData, setFormData] = useState({
    applicationName: "",
    endpoints: [
      {
        environment: "",
        source: "",
        destination: "",
        portNo: "",
        appUrl: "",
        dnsName: "",
      },
    ],
    apiDescription: "",
    applicationDescription: "",
    request: "",
    response: "",
    attachment: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e, index, field) => {
    const updatedEndpoints = [...formData.endpoints];
    updatedEndpoints[index][field] = e.target.value;
    setFormData({ ...formData, endpoints: updatedEndpoints });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, attachment: e.target.files[0] });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key !== "endpoints") {
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

      console.log("formDataToSend", formDataToSend);
      const response = await axios.post("/api/apis", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      alert("API Created Successfully!");
      navigate("/");
    } catch (err) {
      let errorMessage = "Failed to create API";
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
      <h2>Create API</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          name="applicationName"
          placeholder="Application Name"
          value={formData.applicationName}
          onChange={(e) =>
            setFormData({ ...formData, applicationName: e.target.value })
          }
          required
        />

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

        <input
          type="file"
          name="attachment"
          accept="application/pdf"
          onChange={handleFileChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create API"}
        </button>
      </form>
    </div>
  );
};

export default CreatePage;
