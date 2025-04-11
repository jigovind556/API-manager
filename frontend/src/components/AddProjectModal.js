import { useState } from 'react';
import axios from 'axios';
import styles from '../styles/Modal.module.css';

const AddProjectModal = ({ onSuccess, onClose }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/applicationOptions', { name }, {
        withCredentials: true
      });
      onSuccess(response.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalInner}>
      <h2>Add New Project</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter Project Name"
            required
          />
        </div>
        <div className={styles.buttonGroup}>
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Project'}
          </button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProjectModal; 