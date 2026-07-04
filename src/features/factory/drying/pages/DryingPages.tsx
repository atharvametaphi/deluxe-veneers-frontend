import { dryingDefinition, FactoryForm, FactoryListing } from "../../shared";

export function DryingListPage() {
  return <FactoryListing definition={dryingDefinition} />;
}

export function AddDryingPage() {
  return <FactoryForm definition={dryingDefinition} mode="add" />;
}

export function EditDryingPage() {
  return <FactoryForm definition={dryingDefinition} mode="edit" />;
}

export function ViewDryingPage() {
  return <FactoryForm definition={dryingDefinition} mode="view" />;
}
