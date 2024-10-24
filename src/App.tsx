import {
  createRenderEffect,
  createSignal,
  Show,
  type Component,
} from "solid-js";
import EarthquakeMap from "./Map";
import { Hyperbase, HyperbaseCollection } from "./hyperbase/hyperbase";
import { initializeDateRange } from "./utils/initializeDateRange";
import DateRangePicker from "./components/DateRangePicker";
import Loading from "./components/Loading";

const App: Component = () => {
  const [hyperbaseCollection, setHyperbaseCollection] =
    createSignal<HyperbaseCollection>();

  const [loading, setLoading] = createSignal(true);
  const [data, setData] = createSignal<EarthquakeData[]>([]);

  const [dateRange, setDateRange] = createSignal<[Date, Date]>(
    initializeDateRange()
  );

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

      setHyperbaseCollection(hyperbaseCollection);
    })();
  });

  createRenderEffect(() => {
    const hb = hyperbaseCollection();
    if (!hb) return;

    const dtrange = dateRange();
    if (!dtrange || dtrange.length !== 2) return;

    (async () => {
      setLoading(true);

      const data = await hb.findMany<EarthquakeData[]>({
        filters: [
          {
            op: "AND",
            children: [
              {
                field: "datetime",
                op: ">=",
                value: dtrange[0],
              },
              {
                field: "datetime",
                op: "<=",
                value: dtrange[1],
              },
            ],
          },
        ],
      });
      setData(data);

      setLoading(false);
    })();
  });

  return (
    <main>
      <EarthquakeMap data={data()} />
      <DateRangePicker dateRange={dateRange()} setDateRange={setDateRange} />
      <Show when={loading()}>
        <Loading />
      </Show>
    </main>
  );
};

export default App;
