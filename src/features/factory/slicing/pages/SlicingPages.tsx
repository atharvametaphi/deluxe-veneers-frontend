import { FactoryForm, FactoryListing, slicingDefinition } from "../../shared";

export function SlicingListPage() {
  return <FactoryListing definition={slicingDefinition} />;
}

export function AddSlicingPage() {
  return <FactoryForm definition={slicingDefinition} mode="add" />;
}

export function EditSlicingPage() {
  return <FactoryForm definition={slicingDefinition} mode="edit" />;
}

export function ViewSlicingPage() {
  return <FactoryForm definition={slicingDefinition} mode="view" />;
}
