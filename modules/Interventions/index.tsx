import ChecklistsList from "./components/ChecklistsList";
import InterventionsList from "./components/InterventionsList";

export default function Pumps() {
  return (
    <div className="w-full flex flex-col gap-2">
      <InterventionsList />
      <ChecklistsList />
    </div>
  );
}
