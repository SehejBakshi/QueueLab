import { StrictMode } from "react";
import ReactDom from "react-dom/client";

import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/header.css";

import App from "./ui/App";

ReactDom.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
