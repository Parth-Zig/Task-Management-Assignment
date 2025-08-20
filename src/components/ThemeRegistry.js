"use client";

import React from "react";
import { CssBaseline, createTheme, ThemeProvider } from "@mui/material";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";

const createEmotionCache = () => createCache({ key: "mui", prepend: true });

export default function ThemeRegistry({ children }) {
  const [cache] = React.useState(() => createEmotionCache());

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: { mode: "light" },
        shape: { borderRadius: 12 },
      }),
    []
  );

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
