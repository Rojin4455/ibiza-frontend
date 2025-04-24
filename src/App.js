import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import UserRouter from "./routes/UserRouter";
import { AccessControlProvider } from "./context/AccessControlContext";

function App() {
  return (
    <Router>
      <AccessControlProvider>
        <Routes>
          <Route path="/*" element={<UserRouter/>}/>
        </Routes>
      </AccessControlProvider>
    </Router>
  );
}

export default App;