import { extendTheme } from "@chakra-ui/react";

const customTheme = extendTheme({
  fonts: {
    heading: "'Sora', sans-serif",
    body: "'Sora', sans-serif",
  },
  styles: {
    global: {
      "@import":
        "url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@100..900&display=swap');",
      body: {
        scrollBehavior: "smooth",
        fontFamily: "'Noto Sans', sans-serif",
        fontStyle: "normal",
      },
      "::-webkit-scrollbar": {
        width: "8px",
      },
      "::-webkit-scrollbar-thumb": {
        backgroundColor: "#6a0dad", // Direct color value
        borderRadius: "5px",
      },
      "::-webkit-scrollbar-track": {
        backgroundColor: "#4b0082",
      },
    },
  },
});

export default customTheme;
