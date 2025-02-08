import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import Layout from "./components/Layout";
import CreatePage from "./pages/CreatePage";
import SearchPage from "./pages/SearchPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
  return (
    <Router>
      <UserProvider>
        <Routes>
          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes inside Layout */}
          <Route
            path="/"
            element={
              <Layout>
                <h2 className="title">Welcome to the Dashboard</h2>
              </Layout>
            }
          />
          <Route
            path="/create"
            element={
              <Layout>
                <CreatePage />
              </Layout>
            }
          />
          <Route
            path="/search"
            element={
              <Layout>
                <SearchPage />
              </Layout>
            }
          />
        </Routes>
      </UserProvider>
    </Router>
  );
}

export default App;
