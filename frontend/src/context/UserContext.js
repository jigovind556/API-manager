import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Create User Context
const UserContext = createContext();

// Custom Hook for Easy Access
export const useUser = () => useContext(UserContext);

// Provider Component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 

  // Fetch User Data (Auto Login)
  const fetchUser = async () => {
    try {
      const res = await axios.get("/api/users/me", { withCredentials: true });
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user)); 
    } catch (error) {
      console.error("Auto-login failed:", error);
      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  // Check Local Storage First 
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      setUser(JSON.parse(storedUser));
      setLoading(false);
    } else {
      fetchUser();
    }
  }, []);

  // Register User
  const register = async (name, username, password) => {
    setLoading(true);
    try {
      const res = await axios.post(
        "/api/users/register",
        { name, username, password },
        { withCredentials: true }
      );
      const data = res.data.data;
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user)); 
      return { success: true, message: data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // Login User
  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await axios.post(
        "/api/users/login",
        { username, password },
        { withCredentials: true }
      );
      const data = res.data.data;
      setUser(data.user);
      console.log(data);
      localStorage.setItem("user", JSON.stringify(data.user));
      return { success: true, message: data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout User
  const logout = async () => {
    try {
      await axios.post("/api/users/logout", {}, { withCredentials: true });
      setUser(null);
      localStorage.removeItem("user"); 
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, register, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};
