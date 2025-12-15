import React from "react";
import { createRoot } from "react-dom/client";
import { extendTheme, ChakraProvider } from "@chakra-ui/react";
import "./index.css";
import App from "./App.jsx";
const theme = extendTheme({
  styles: {
    global: {
      "html, body": {
        backgroundColor: "#121419",
        color: "#968b89",
        minH: "100vh",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        textAlign: "center",
      },
      ".boxSinglePost": {
        p: "5",
        shadow: "md",
        borderWidth: "1px",
        borderRadius: "md",
        mb: "5",
        _hover: {
          transform: "scale(1.01)",
          transition: "transform 0.2s",
          cursor: "pointer",
        },
      },
    },
  },
});
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
