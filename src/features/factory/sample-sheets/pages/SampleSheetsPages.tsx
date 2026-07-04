import { FactoryForm, FactoryListing, sampleSheetsDefinition } from "../../shared";

export function SampleSheetsListPage() {
  return <FactoryListing definition={sampleSheetsDefinition} />;
}

export function AddSampleSheetsPage() {
  return <FactoryForm definition={sampleSheetsDefinition} mode="add" />;
}

export function EditSampleSheetsPage() {
  return <FactoryForm definition={sampleSheetsDefinition} mode="edit" />;
}

export function ViewSampleSheetsPage() {
  return <FactoryForm definition={sampleSheetsDefinition} mode="view" />;
}
