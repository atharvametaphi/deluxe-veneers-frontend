import { exportOemDefinition, FactoryForm, FactoryListing } from "../../shared";

export function ExportOemListPage() {
  return <FactoryListing definition={exportOemDefinition} />;
}

export function AddExportOemPage() {
  return <FactoryForm definition={exportOemDefinition} mode="add" />;
}

export function EditExportOemPage() {
  return <FactoryForm definition={exportOemDefinition} mode="edit" />;
}

export function ViewExportOemPage() {
  return <FactoryForm definition={exportOemDefinition} mode="view" />;
}
