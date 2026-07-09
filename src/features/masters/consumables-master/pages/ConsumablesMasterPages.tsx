import { MasterFormPage, MasterListingPage } from "../../shared";
import { consumablesMasterDefinition } from "../mock/consumablesMasterData";

export function ConsumablesMasterListPage() {
  return <MasterListingPage definition={consumablesMasterDefinition} />;
}

export function AddConsumablesMasterPage() {
  return <MasterFormPage definition={consumablesMasterDefinition} mode="add" />;
}

export function EditConsumablesMasterPage() {
  return <MasterFormPage definition={consumablesMasterDefinition} mode="edit" />;
}

export function ViewConsumablesMasterPage() {
  return <MasterFormPage definition={consumablesMasterDefinition} mode="view" />;
}
