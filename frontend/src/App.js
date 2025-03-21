import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import Layout from "./components/Layout";
import CreatePage from "./pages/CreatePage";
import SearchPage from "./pages/SearchPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EditPage from "./pages/EditPage";
import CreateApplication from "./pages/CreateApplication";
import ApplicationsList from "./pages/ApplicationsList";
import EditApplication from "./pages/EditApplication";
import { MyProvider } from "./context/MyContext";
import ApiChangeHistory from "./pages/ApiChangeHistory";

function App() {
  return (
    <Router>
      <UserProvider>
        <MyProvider   >
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
            path="/create-api"
            element={
              <Layout>
                <CreatePage />
              </Layout>
            }
          />
          <Route
            path="/api-update-history"
            element={
              <Layout>
                <ApiChangeHistory />
              </Layout>
            }
          />
          <Route
            path="/api-update-history/:id"
            element={
              <Layout>
                <ApiChangeHistory />
              </Layout>
            }
          />
          <Route
            path="/create-application"
            element={
              <Layout>
                <CreateApplication />
              </Layout>
            }
          />
          <Route
            path="/applications-search"
            element={
              <Layout>
                <ApplicationsList />
              </Layout>
            }
          />
          <Route
            path="/search-api"
            element={
              <Layout>
                <SearchPage />
              </Layout>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <Layout>
                <EditPage />
              </Layout>
            }
          />
          <Route
            path="/edit-application/:id"
            element={
              <Layout>
                <EditApplication />
              </Layout>
            }
          />
        </Routes>
        </MyProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
