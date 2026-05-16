import React, { JSX, StrictMode, useState } from "react";
import AppRouter from "~/AppRouter";
import AppRoutes from "~/AppRoutes";
import Aside from "~/components/Aside";
import Header from "~/components/Header";

function App({ url }: { url?: string }): JSX.Element {
  const [isMenuOpen, setMenuOpen] = useState<boolean>(false);

  return (
    <StrictMode>
      <AppRouter url={url}>
        <Header menuOpen={isMenuOpen} menuOpenSetter={setMenuOpen} />
        <Aside open={isMenuOpen} />
        <main className="has-header">
          <AppRoutes />
        </main>
      </AppRouter>
    </StrictMode>
  );
}

export default App;
