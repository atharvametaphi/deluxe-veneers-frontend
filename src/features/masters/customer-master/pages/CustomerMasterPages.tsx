import { MasterFormPage, MasterListingPage } from "../../shared";
import { customerMasterDefinition } from "../mock/customerMasterData";

export function CustomerMasterListPage() {
  return <MasterListingPage definition={customerMasterDefinition} />;
}

export function AddCustomerMasterPage() {
  return <MasterFormPage definition={customerMasterDefinition} mode="add" />;
}

export function EditCustomerMasterPage() {
  return <MasterFormPage definition={customerMasterDefinition} mode="edit" />;
}

export function ViewCustomerMasterPage() {
  return <MasterFormPage definition={customerMasterDefinition} mode="view" />;
}
