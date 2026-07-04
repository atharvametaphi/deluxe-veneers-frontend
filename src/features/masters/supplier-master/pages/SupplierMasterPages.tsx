import { MasterFormPage, MasterListingPage } from "../../shared";
import { supplierMasterDefinition } from "../mock/supplierMasterData";

export function SupplierMasterListPage() {
  return <MasterListingPage definition={supplierMasterDefinition} />;
}

export function AddSupplierMasterPage() {
  return <MasterFormPage definition={supplierMasterDefinition} mode="add" />;
}

export function EditSupplierMasterPage() {
  return <MasterFormPage definition={supplierMasterDefinition} mode="edit" />;
}

export function ViewSupplierMasterPage() {
  return <MasterFormPage definition={supplierMasterDefinition} mode="view" />;
}
