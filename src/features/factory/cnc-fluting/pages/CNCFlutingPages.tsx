import { cncFlutingDefinition, FactoryForm, FactoryListing } from "../../shared";

export function CNCFlutingListPage() {
  return <FactoryListing definition={cncFlutingDefinition} />;
}

export function AddCNCFlutingPage() {
  return <FactoryForm definition={cncFlutingDefinition} mode="add" />;
}

export function EditCNCFlutingPage() {
  return <FactoryForm definition={cncFlutingDefinition} mode="edit" />;
}

export function ViewCNCFlutingPage() {
  return <FactoryForm definition={cncFlutingDefinition} mode="view" />;
}
