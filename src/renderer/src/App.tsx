import { useEffect, useState } from "react";
import { Sidebar, type Route } from "./components/Sidebar";
import { HomePage } from "./pages/HomePage";
import { StatsPage } from "./pages/StatsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AboutPage } from "./pages/AboutPage";
import { Mascot } from "./mascot/Mascot";

function getRoute(): Route {
  const hash = window.location.hash;
  if (hash.startsWith("#/stats")) return "stats";
  if (hash.startsWith("#/settings")) return "settings";
  if (hash.startsWith("#/about")) return "about";
  return "home";
}

function App(): React.JSX.Element {
  const [route, setRoute] = useState<Route>(() =>
    window.location.hash.startsWith("#/mascot") ? "home" : getRoute(),
  );

  useEffect(() => {
    const onHash = (): void => {
      // Mascot is a separate window; keep home route for the shell.
      if (window.location.hash.startsWith("#/mascot")) return;
      setRoute(getRoute());
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (window.location.hash.startsWith("#/mascot")) {
    return <Mascot />;
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-(--bg-primary)">
      <Sidebar route={route} onNavigate={setRoute} />
      <main className="min-w-0 flex-1">
        {route === "home" && <HomePage />}
        {route === "stats" && <StatsPage />}
        {route === "settings" && <SettingsPage />}
        {route === "about" && <AboutPage />}
      </main>
    </div>
  );
}

export default App;
