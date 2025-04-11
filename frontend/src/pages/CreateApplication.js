// CreateApplication.js
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Create.module.css";
import AddProjectModal from "../components/AddProjectModal";
import { useModal } from "../context/ModalContext";

const CreateApplication = () => {
  const navigate = useNavigate();
  const { showModal, hideModal } = useModal();
  const [selectOptions, setSelectOptions] = useState([]);
  const [formData, setFormData] = useState({
    projectname: "",
    appName: "",
    applicationDescription: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSelectOptions = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/applicationOptions", {
          withCredentials: true,
        });
        setSelectOptions([
          {
            _id: "--select--",
            name: "--select--",
          },
          ...response.data.data,
        ]);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch Applications");
      } finally {
        setLoading(false);
      }
    };
    fetchSelectOptions();
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
      //   const formDataToSend = new FormData();
      //   Object.keys(formData).forEach((key) => {
      //     formDataToSend.append(key, formData[key]);
      //   });

      if (formData.projectname === "--select--") {
        throw new Error("Please select an application");
      }
      if (formData.appName === "") {
        throw new Error("Please enter an app name");
      }
      await axios.post("/api/applications", formData, {
        withCredentials: true,
      });

      setFormData({
        projectname: "",
        appName: "",
        applicationDescription: "",
      });
      alert("Application Created Successfully!");
      //   navigate("/");
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

  const handleAddProject = () => {
    showModal(
      <AddProjectModal
        onSuccess={(newProject) => {
          setSelectOptions([...selectOptions, newProject]);
        }}
        onClose={hideModal}
      />
    );
  };

  return (
    <div className={styles.container}>
      <h2>Create Application</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.projectSelectGroup}>
          <select
            name="projectname"
            value={formData.projectname}
            onChange={handleChange}
            required
            className={styles.select}
          >
            {selectOptions.map((option, index) => (
              <option key={option._id} value={option._id}>
                {option.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddProject}
            className={styles.addProjectBtn}
          >
            Add Project
          </button>
        </div>
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
          {loading ? "Creating..." : "Create Application"}
        </button>
      </form>
    </div>
  );
};

export default CreateApplication;
