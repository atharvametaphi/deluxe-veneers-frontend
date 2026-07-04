import { FactoryForm, FactoryListing, marquetryDefinition } from "../../shared";

export function MarquetryListPage() {
  return <FactoryListing definition={marquetryDefinition} />;
}

export function AddMarquetryPage() {
  return <FactoryForm definition={marquetryDefinition} mode="add" />;
}

export function EditMarquetryPage() {
  return <FactoryForm definition={marquetryDefinition} mode="edit" />;
}

export function ViewMarquetryPage() {
  return <FactoryForm definition={marquetryDefinition} mode="view" />;
}
