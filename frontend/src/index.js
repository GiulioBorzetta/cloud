import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import DynamicFolderPage from "./pages/DynamicFolderPage";
import ProtectedRoute from "./components/ProtectedRoute";
import SettingsPage from "./components/SettingsPage";
import AdminRoute from "./components/admin/AdminRoute";
import AdminDashboard from "./components/admin/AdminDashboard";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />

        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/folder-contents/:folderPath/*"
          element={
            <ProtectedRoute>
              <DynamicFolderPage />
            </ProtectedRoute>
          }
          onEnter={() => console.log('Navigazione corretta!')}
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
