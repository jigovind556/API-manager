import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import Layout from "./components/Layout";
import CreatePage from "./pages/CreatePage";
import SearchPage from "./pages/SearchPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { MyProvider } from "./context/MyContext";
import ApiChangeHistory from "./pages/ApiChangeHistory";
import ApiHistorySummary from "./pages/ApiHistorySummary";
import { ModalProvider } from "./context/ModalContext";
import CreateApplication from "./pages/CreateApplication";
import ApplicationsList from "./pages/ApplicationsList";

function App() {
  return (
    <Router>
      <ModalProvider>
        <UserProvider>
          <MyProvider>
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
              />              <Route
                path="/api-history-summary"
                element={
                  <Layout>
                    <ApiHistorySummary />
                  </Layout>
                }
              />
              <Route
                path="/api-history/:id"
                element={
                  <Layout>
                    <ApiChangeHistory />
                  </Layout>
                }
              />
              <Route
                path="/edit/:id"
                element={
                  <Layout>
                    <CreatePage />
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
            </Routes>
          </MyProvider>
        </UserProvider>
      </ModalProvider>
    </Router>
  );
}

export default App;
