import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import {
  Home,
  Doubts,
  Environments,
  Parties,
  Reservations,
  Rules,
  Contact,
  Footer,
} from "../pages/index";
import { useTheme } from "../hooks/theme/useTheme";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Header } from "../components";

export const mainRoutes = () => {
  const { dark } = useTheme();

  const theme = createTheme({
    palette: {
      mode: dark ? "dark" : "light",
    },
  });

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ambientes" element={<Environments />} />
          <Route path="/festas" element={<Parties />} />
          <Route path="/reservas" element={<Reservations />} />
          <Route path="/regras" element={<Rules />} />
          <Route path="/duvidas" element={<Doubts />} />
          <Route path="/contato_localizacao" element={<Contact />} />
        </Routes>
        <Footer />
      </ThemeProvider>
    </BrowserRouter>
  );
};
