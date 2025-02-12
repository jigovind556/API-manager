//EditPage.js
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../styles/Create.module.css";


const EditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
    attachment: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApiData = async () => {
      try {
        const response = await axios.get(`/api/apis/${id}`, {
          withCredentials: true,
        });
        const data = response.data.data;
        setFormData((prevFormData) => ({
          applicationName: data.applicationName || "",
          source: data.source || "",
          destination: data.destination || "",
          portNo: data.portNo || "",
          appUrl: data.appUrl || "",
          apiDescription: data.apiDescription || "",
          applicationDescription: data.applicationDescription || "",
          dnsName: data.dnsName || "",
          request: JSON.stringify(data.request || ""),
          response: JSON.stringify(data.response || ""),
          attachment: null, // Reset attachment to null for new uploads
        }));

      } catch (err) {
        setError("Failed to fetch API details");
      }
    };
    fetchApiData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, attachment: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      await axios.put(`/api/apis/${id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      alert("API Updated Successfully!");
      navigate("/search");
    } catch (err) {
      setError("Failed to update API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Edit API</h2>
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
          placeholder="API Description"
          value={formData.apiDescription}
          onChange={handleChange}
        ></textarea>
        <textarea
          name="applicationDescription"
          placeholder="Application Description"
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
          accept="application/pdf"
          onChange={handleFileChange}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update API"}
        </button>
      </form>
    </div>
  );
};

export default EditPage;
