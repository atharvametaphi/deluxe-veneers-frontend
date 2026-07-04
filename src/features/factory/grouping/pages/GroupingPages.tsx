import { FactoryForm, FactoryListing, groupingDefinition } from "../../shared";

export function GroupingListPage() {
  return <FactoryListing definition={groupingDefinition} />;
}

export function AddGroupingPage() {
  return <FactoryForm definition={groupingDefinition} mode="add" />;
}

export function EditGroupingPage() {
  return <FactoryForm definition={groupingDefinition} mode="edit" />;
}

export function ViewGroupingPage() {
  return <FactoryForm definition={groupingDefinition} mode="view" />;
}
