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
  // State for form fields
  const [formData, setFormData] = useState({
    applicationName: "",
    environment: "",
    source: "",
    destination: "",
    portNo: "",
    appUrl: "",
    apiDescription: "",
    applicationDescription: "",
    dnsName: "",
    request: "",
    response: "",
    attachment: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle file input
  const handleFileChange = (e) => {
    setFormData({ ...formData, attachment: e.target.files[0] });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });
      // Add source, destination, and portNo as separate fields
      formDataToSend.append("sourceDestinationPorts[source]", formData.source);
      formDataToSend.append(
        "sourceDestinationPorts[destination]",
        formData.destination
      );
      formDataToSend.append("sourceDestinationPorts[portNo]", formData.portNo);

      // Remove source, destination, and portNo from formDataToSend
      formDataToSend.delete("source");
      formDataToSend.delete("destination");
      formDataToSend.delete("portNo");
      const response = await axios.post("/api/apis", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      alert("API Created Successfully!");
      navigate("/");
    } catch (err) {
      let errorMessage = "Failed to create API";

      if (err.response) {
        // Try to extract JSON error message
        if (err.response.data && typeof err.response.data === "object") {
          errorMessage = err.response.data.message || errorMessage;
        }
        // Handle HTML error response
        else if (typeof err.response.data === "string") {
          const matches = err.response.data.match(/Error:\s([^<]+)/);
          if (matches && matches[1]) {
            errorMessage = matches[1].trim();
          }
        }
      }
      console.log(err);
      console.log(errorMessage);
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
          onChange={handleChange}
          required
        />
        <select
          name="environment"
          value={formData.environment}
          onChange={handleChange}
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
          name="source"
          placeholder="Source"
          value={formData.source}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="destination"
          placeholder="Destination"
          value={formData.destination}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="portNo"
          placeholder="Port Number"
          value={formData.portNo}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="appUrl"
          placeholder="App URL"
          value={formData.appUrl}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="dnsName"
          placeholder="DNS Name"
          value={formData.dnsName}
          onChange={handleChange}
          required
        />

        <textarea
          name="apiDescription"
          placeholder="API Description (Optional)"
          value={formData.apiDescription}
          onChange={handleChange}
        ></textarea>

        <textarea
          name="applicationDescription"
          placeholder="Application Description (Optional)"
          value={formData.applicationDescription}
          onChange={handleChange}
        ></textarea>

        <textarea
          name="request"
          placeholder="Request Data"
          value={formData.request}
          onChange={handleChange}
          required
        ></textarea>

        <textarea
          name="response"
          placeholder="Response Data"
          value={formData.response}
          onChange={handleChange}
          required
        ></textarea>

        <input
          type="file"
          name="attachment"
          accept="application/pdf" // Restricts file selection to PDFs
          placeholder="Attachment"
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
