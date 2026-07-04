import { FactoryForm, FactoryListing, pressingDefinition } from "../../shared";

export function PressingListPage() {
  return <FactoryListing definition={pressingDefinition} />;
}

export function AddPressingPage() {
  return <FactoryForm definition={pressingDefinition} mode="add" />;
}

export function EditPressingPage() {
  return <FactoryForm definition={pressingDefinition} mode="edit" />;
}

export function ViewPressingPage() {
  return <FactoryForm definition={pressingDefinition} mode="view" />;
}
