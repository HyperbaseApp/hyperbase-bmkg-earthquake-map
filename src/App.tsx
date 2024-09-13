import { createRenderEffect, createSignal, type Component } from "solid-js";
import EarthquakeMap from "./Map";
import { Hyperbase } from "./hyperbase/hyperbase";

const App: Component = () => {
  const [data, setData] = createSignal<EarthquakeData[]>([]);

  createRenderEffect(() => {
    (async () => {
      const hyperbase = new Hyperbase(import.meta.env.VITE_HYPERBASE_BASE_URL);

      await hyperbase.authenticate(
        import.meta.env.VITE_HYPERBASE_AUTH_TOKEN_ID,
        import.meta.env.VITE_HYPERBASE_AUTH_TOKEN,
        import.meta.env.VITE_HYPERBASE_AUTH_COLLECTION_ID,
        new Map<string, any>([
          ["username", import.meta.env.VITE_HYPERBASE_AUTH_CREDENTIAL_USERNAME],
          ["password", import.meta.env.VITE_HYPERBASE_AUTH_CREDENTIAL_PASSWORD],
        ])
      );

      const hyperbaseProject = hyperbase.setProject(
        import.meta.env.VITE_HYPERBASE_PROJECT_ID
      );

      const hyperbaseCollection = hyperbaseProject.setCollection(
        import.meta.env.VITE_HYPERBASE_COLLECTION_ID
      );

      const data = await hyperbaseCollection.findMany<EarthquakeData[]>();
      setData(data);
    })();
  });

  return <EarthquakeMap data={data()} />;
};

export default App;
