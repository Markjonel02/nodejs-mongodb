import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ChakraProvider } from "@chakra-ui/react";
import customTheme from "./Theme.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/*     <BrowserRouter> */}
    <ChakraProvider theme={customTheme}>
      <App />
    </ChakraProvider>
    {/*     </BrowserRouter> */}
  </React.StrictMode>
);
