import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { IntlProvider } from "react-intl";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <IntlProvider locale="en">
      <App />
    </IntlProvider>
  </React.StrictMode>
);
