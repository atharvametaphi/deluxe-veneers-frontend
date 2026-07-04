import { embossingDefinition, FactoryForm, FactoryListing } from "../../shared";

export function EmbossingListPage() {
  return <FactoryListing definition={embossingDefinition} />;
}

export function AddEmbossingPage() {
  return <FactoryForm definition={embossingDefinition} mode="add" />;
}

export function EditEmbossingPage() {
  return <FactoryForm definition={embossingDefinition} mode="edit" />;
}

export function ViewEmbossingPage() {
  return <FactoryForm definition={embossingDefinition} mode="view" />;
}
