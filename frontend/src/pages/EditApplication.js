// EditApplication.js
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../styles/Create.module.css";

const EditApplication = () => {
    const { id } = useParams();
  const navigate = useNavigate();
  const [selectOptions, setSelectOptions] = useState([]);
  const [formData, setFormData] = useState({
    applicationName: "",
    appName: "",
    applicationDescription: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [select_response,application_data] = await Promise.all([
        axios.get("/api/applicationOptions", {
            withCredentials: true,
            }),
            axios.get(`/api/applications/${id}`, {
            withCredentials: true,
            }),
        ]);
      setSelectOptions([
        {
          _id: "--select--",
          name: "--select--",
        },
        ...select_response.data.data,
      ]);
        const data = application_data.data.data;
        setFormData((prevFormData) => ({
          applicationName: data.applicationName || "",
          appName: data.appName || "",
          applicationDescription: data.applicationDescription || "",
        }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch Applications");
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {

      if (formData.applicationName === "--select--") {
        throw new Error("Please select an application");
      }
      if (formData.appName === "") {
        throw new Error("Please enter an app name");
      }
      await axios.post("/api/applications", formData, {
        withCredentials: true,
      });

      setFormData({
        applicationName: "",
        appName: "",
        applicationDescription: "",
      });
      alert("Application updated Successfully!");
      navigate("/applications-search");
    } catch (err) {
      let errorMessage = "Failed to create API";
      if (err.response) {
        if (err.response.data && typeof err.response.data === "object") {
          errorMessage = err.response.data.message || errorMessage;
        } else if (typeof err.response.data === "string") {
          const matches = err.response.data.match(/Error:\s([^<]+)/);
          if (matches && matches[1]) {
            errorMessage = matches[1].trim();
          }
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Create Application</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <select
          name="applicationName"
          value={formData.applicationName}
          onChange={handleChange}
          required
          className={styles.select}
        >
          {selectOptions.map((option, index) => (
            <option key={option._id} value={option.name}>
              {option.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="appName"
          placeholder="App Name"
          value={formData.appName}
          onChange={handleChange}
          required
        />
        <textarea
          name="applicationDescription"
          placeholder="Application Description (Optional)"
          value={formData.applicationDescription}
          onChange={handleChange}
        ></textarea>
        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Application"}
        </button>
      </form>
    </div>
  );
};

export default EditApplication;
