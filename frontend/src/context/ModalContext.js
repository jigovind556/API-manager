import { createContext, useContext, useState } from "react";
import styles from "../styles/Modal.module.css";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modalContent, setModalContent] = useState(null);

  const showModal = (content) => {
    setModalContent(content);
  };

  const hideModal = () => {
    setModalContent(null);
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      {modalContent && (
        <div className={styles.modalOverlay} onClick={hideModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeButton} onClick={hideModal}>
              &times;
            </button>
            {modalContent}
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
