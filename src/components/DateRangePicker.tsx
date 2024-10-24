import { JSX, Setter } from "solid-js";

interface Props {
  dateRange: [Date, Date];
  setDateRange: Setter<[Date, Date]>;
}

export default function DateRangePicker(props: Props) {
  function handleStartDateChange(e: Event) {
    const target = e.target as HTMLInputElement;
    props.setDateRange((prev) => [new Date(target.value), prev[1]]);
  }

  function handleEndDateChange(e: Event) {
    const target = e.target as HTMLInputElement;
    props.setDateRange((prev) => [prev[0], new Date(target.value)]);
  }

  return (
    <div class="absolute bottom-10 left-2 bg-white">
      <input
        type="date"
        value={props.dateRange[0].toISOString().split("T")[0]}
        onchange={handleStartDateChange}
        max={props.dateRange[1].toISOString().split("T")[0]}
      />
      <span class="px-2.5">sampai</span>
      <input
        type="date"
        value={props.dateRange[1].toISOString().split("T")[0]}
        onchange={handleEndDateChange}
        min={props.dateRange[0].toISOString().split("T")[0]}
        max={new Date().toISOString().split("T")[0]}
      />
    </div>
  );
}
