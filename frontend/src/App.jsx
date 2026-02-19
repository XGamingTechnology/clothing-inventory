import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RoutesComponent from "./routes";
import "./styles/globals.css";

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <RoutesComponent />
      </AuthProvider>
    </Router>
  );
}

export default App;
