
"use client";

import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react";
import { ColorModeProvider } from "./color-mode";

const config = defineConfig({
  theme: {
    styles: {
      global: {
        "*": {
          margin: 0,
          padding: 0,
          boxSizing: "border-box",
          textDecoration: "none",
        },
      },
    },
  },
});

const system = createSystem(defaultConfig, config);

export function Provider(props) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  );
}
