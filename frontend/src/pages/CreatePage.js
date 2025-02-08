import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Create.module.css";

const CreatePage = () => {
  const navigate = useNavigate();

  // State for form fields
  const [formData, setFormData] = useState({
    applicationName: "",
    source: "",
    destination: "",
    portNo: "",
    appUrl: "",
    apiDescription: "",
    applicationDescription: "",
    dnsName: "",
    request: "",
    response: "",
    attachment: "",
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
      const response = await axios.post(
        "/api/apis",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      alert("API Created Successfully!");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create API");
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

        <input type="text" name="attachment" placeholder="Atachment" onChange={handleChange} />

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create API"}
        </button>
      </form>
    </div>
  );
};

export default CreatePage;
