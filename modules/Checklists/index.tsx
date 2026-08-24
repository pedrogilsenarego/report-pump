import ActionsList from "./components/ActionsList";
import ChecklistsList from "./components/ChecklistsList";

export default function Checklists() {
  return (
    <div className="w-full flex flex-col gap-8">
      <ChecklistsList />
      <ActionsList />
    </div>
  );
}
