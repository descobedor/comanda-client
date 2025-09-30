import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { UuidProvider } from "./UuidContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UuidProvider>
      <App />
    </UuidProvider>
  </React.StrictMode>
);
