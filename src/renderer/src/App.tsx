import { useEffect, useState } from "react";
import { Dashboard } from "./dashboard/Dashboard";
import { Mascot } from "./mascot/Mascot";

type Route = "dashboard" | "mascot";

function getRoute(): Route {
  return window.location.hash.startsWith("#/mascot") ? "mascot" : "dashboard";
}

function App(): React.JSX.Element {
  const [route, setRoute] = useState<Route>(getRoute);

  useEffect(() => {
    const onHash = (): void => setRoute(getRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return route === "mascot" ? <Mascot /> : <Dashboard />;
}

export default App;
