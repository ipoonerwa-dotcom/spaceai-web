import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "./lib/chain";
import { I18nProvider } from "./lib/i18n";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Starfield from "./components/Starfield";
import Landing from "./pages/Landing";
import Console from "./pages/Console";

const queryClient = new QueryClient();

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <BrowserRouter>
            <Starfield />
            <Nav />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/app" element={<Console />} />
              <Route path="*" element={<Landing />} />
            </Routes>
            <Footer />
          </BrowserRouter>
        </I18nProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
