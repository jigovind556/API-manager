// MyContext.js
import React, { createContext, useState, useContext } from "react";
// Create context
const MyContext = createContext();
// Create the provider component
export const MyProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };
  return (
    <MyContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => useContext(MyContext);
export default MyContext;
