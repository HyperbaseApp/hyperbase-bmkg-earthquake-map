import { createEffect, createSignal, For, Show } from "solid-js";
import MapGL, { Marker, Viewport } from "solid-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Props {
  data: EarthquakeData[];
}

export default function EarthquakeMap(props: Props) {
  const [data, setData] = createSignal<MapData[]>([]);
  const [popupIdx, setPopupIdx] = createSignal(-1);

  const [viewport, setViewport] = createSignal({
    center: [120, -1],
    zoom: 4,
  } as Viewport);

  createEffect(() => {
    if (!props.data) return;

    const mapData = new Array<MapData>(props.data.length);

    props.data.forEach((val, idx) => {
      const coordinatesStrSplit = val.coordinates.split(",");
      const latitude = Number(coordinatesStrSplit[0]);
      const longitude = Number(coordinatesStrSplit[1]);

      mapData[idx] = {
        coordinates: [longitude, latitude],
        rawData: val,
      };
    });

    setData(mapData);
  }, [props.data]);

  return (
    <>
      <MapGL
        options={{ style: "mb:outdoor" }}
        viewport={viewport()}
        onViewportChange={(evt: Viewport) => setViewport(evt)}
      >
        <For each={data()}>
          {(d, idx) => (
            <Marker
              lngLat={d.coordinates}
              options={{
                element: (
                  <div
                    style={{
                      width: Number(d.rawData.magnitude) * 5 + "px",
                      height: Number(d.rawData.magnitude) * 5 + "px",
                    }}
                  >
                    <div class="absolute w-full h-full rounded-full bg-red-600/50 animate-ping" />
                    <div class="w-full h-full rounded-full bg-red-600/70" />
                  </div>
                ) as HTMLElement,
              }}
              showPopup={idx() === popupIdx()}
              onOpen={() => setPopupIdx(idx())}
              onClose={() => setPopupIdx(-1)}
            >
              <div class="h-60 overflow-y-auto">
                <p>Tanggal: {d.rawData.tanggal}</p>
                <p>Jam: {d.rawData.jam}</p>
                <p>Lintang: {d.rawData.lintang}</p>
                <p>Bujur: {d.rawData.bujur}</p>
                <p>Magnitude: {d.rawData.magnitude}</p>
                <p>Kedalaman: {d.rawData.kedalaman}</p>
                <p>Wilayah: {d.rawData.wilayah}</p>
                <p>Potensi: {d.rawData.potensi}</p>
                <Show when={d.rawData.dirasakan}>
                  <p>Dirasakan: {d.rawData.dirasakan}</p>
                </Show>
                <Show when={d.rawData.shakemap_url}>
                  <div class="mt-2 relative group">
                    <a
                      href={d.rawData.shakemap_url}
                      target="_blank"
                      class="absolute invisible group-hover:visible h-full w-full bg-black/40 flex items-center justify-center text-center text-white"
                    >
                      Buka di tab baru
                    </a>
                    <img src={d.rawData.shakemap_url} />
                  </div>
                </Show>
              </div>
            </Marker>
          )}
        </For>
      </MapGL>
    </>
  );
}

interface MapData {
  coordinates: [number, number];
  rawData: EarthquakeData;
}
