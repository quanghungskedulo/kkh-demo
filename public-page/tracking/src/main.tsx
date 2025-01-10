import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.css';
import { getConfig } from "./utils/api.ts";

//load config from skedulo here
const conf = await getConfig()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App config={conf} />
   </BrowserRouter>
  </React.StrictMode>,
);
