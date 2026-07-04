import { FactoryForm, FactoryListing, splicingDefinition } from "../../shared";

export function SplicingListPage() {
  return <FactoryListing definition={splicingDefinition} />;
}

export function AddSplicingPage() {
  return <FactoryForm definition={splicingDefinition} mode="add" />;
}

export function EditSplicingPage() {
  return <FactoryForm definition={splicingDefinition} mode="edit" />;
}

export function ViewSplicingPage() {
  return <FactoryForm definition={splicingDefinition} mode="view" />;
}
