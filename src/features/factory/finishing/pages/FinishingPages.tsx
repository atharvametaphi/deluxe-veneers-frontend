import { FactoryForm, FactoryListing, finishingDefinition } from "../../shared";

export function FinishingListPage() {
  return <FactoryListing definition={finishingDefinition} />;
}

export function AddFinishingPage() {
  return <FactoryForm definition={finishingDefinition} mode="add" />;
}

export function EditFinishingPage() {
  return <FactoryForm definition={finishingDefinition} mode="edit" />;
}

export function ViewFinishingPage() {
  return <FactoryForm definition={finishingDefinition} mode="view" />;
}
