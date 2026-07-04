import { MasterFormPage, MasterListingPage } from "../../shared";
import { warehouseLocationMasterDefinition } from "../mock/warehouseLocationMasterData";

export function WarehouseLocationMasterListPage() {
  return <MasterListingPage definition={warehouseLocationMasterDefinition} />;
}

export function AddWarehouseLocationMasterPage() {
  return (
    <MasterFormPage
      definition={warehouseLocationMasterDefinition}
      mode="add"
    />
  );
}

export function EditWarehouseLocationMasterPage() {
  return (
    <MasterFormPage
      definition={warehouseLocationMasterDefinition}
      mode="edit"
    />
  );
}

export function ViewWarehouseLocationMasterPage() {
  return (
    <MasterFormPage
      definition={warehouseLocationMasterDefinition}
      mode="view"
    />
  );
}
