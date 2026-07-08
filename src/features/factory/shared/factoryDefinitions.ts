import type { EnterpriseTableColumn } from "../../../components/data-display/EnterpriseDataTable";
import type { MasterFieldDefinition } from "../../masters/shared";
import {
  createFactoryRows,
  expandFactoryRowsForTabs,
  createSection,
  uniqueFactoryOptions,
} from "./factoryUtils";
import type { FactoryDefinition, FactoryRecord } from "./types";

const asDate = (value: string) => new Date(value);

const column = (key: string, label: string): EnterpriseTableColumn<FactoryRecord> => ({
  key,
  label,
});

const textField = (
  key: string,
  label: string,
  options?: Partial<MasterFieldDefinition>,
): MasterFieldDefinition => ({
  key,
  label,
  type: "text",
  ...options,
});

const dateField = (
  key: string,
  label: string,
): MasterFieldDefinition => ({
  key,
  label,
  type: "date",
});

const selectField = (
  key: string,
  label: string,
  rows: readonly FactoryRecord[],
): MasterFieldDefinition => ({
  key,
  label,
  type: "select",
  options: uniqueFactoryOptions(rows, key),
});

const remarkField = (): MasterFieldDefinition => ({
  key: "remark",
  label: "Remark",
  type: "text",
  span: "full",
});

const veneerLots = [
  {
    supplierName: "Arihant Veneers LLP",
    itemName: "Oak Veneer",
    subCategory: "Quarter Cut",
    color: "Natural Oak",
    length: "2600 mm",
    width: "1220 mm",
    thickness: "0.60 mm",
    palletNo: "PAL-SLC-01",
  },
  {
    supplierName: "Euro Timber Exports",
    itemName: "Walnut Veneer",
    subCategory: "Crown Cut",
    color: "Dark Walnut",
    length: "2500 mm",
    width: "1270 mm",
    thickness: "0.55 mm",
    palletNo: "PAL-SLC-02",
  },
  {
    supplierName: "Shree Wood Panels",
    itemName: "Teak Veneer",
    subCategory: "Natural",
    color: "Golden Brown",
    length: "2400 mm",
    width: "1200 mm",
    thickness: "0.50 mm",
    palletNo: "PAL-SLC-03",
  },
  {
    supplierName: "Prime Timber Sources",
    itemName: "Ash Veneer",
    subCategory: "Crown Cut",
    color: "Light Ash",
    length: "2550 mm",
    width: "1240 mm",
    thickness: "0.58 mm",
    palletNo: "PAL-SLC-04",
  },
  {
    supplierName: "Nordic Veneer House",
    itemName: "Oak Veneer",
    subCategory: "Rift Cut",
    color: "Smoked Natural",
    length: "2800 mm",
    width: "1250 mm",
    thickness: "0.65 mm",
    palletNo: "PAL-SLC-05",
  },
  {
    supplierName: "Royal Laminates India",
    itemName: "Walnut Veneer",
    subCategory: "Natural",
    color: "Classic Walnut",
    length: "2480 mm",
    width: "1230 mm",
    thickness: "0.60 mm",
    palletNo: "PAL-SLC-06",
  },
] as const;

const productionGroups = [
  {
    groupNo: "GRP-2401",
    customerName: "Prime Habitat Studio",
    productName: "Lobby Wall Panel",
    itemName: "Oak Veneer",
    itemSubCategory: "Quarter Cut",
    colour: "Natural Oak",
    length: "2440 mm",
    width: "1220 mm",
    thickness: "1.20 mm",
  },
  {
    groupNo: "GRP-2402",
    customerName: "Aura Living Concepts",
    productName: "Bedroom Wardrobe Front",
    itemName: "Walnut Veneer",
    itemSubCategory: "Crown Cut",
    colour: "Dark Walnut",
    length: "2500 mm",
    width: "1200 mm",
    thickness: "1.10 mm",
  },
  {
    groupNo: "GRP-2403",
    customerName: "Woodform Spaces",
    productName: "Conference Table Top",
    itemName: "Teak Veneer",
    itemSubCategory: "Natural",
    colour: "Golden Brown",
    length: "2700 mm",
    width: "1250 mm",
    thickness: "1.00 mm",
  },
  {
    groupNo: "GRP-2404",
    customerName: "Timberline Projects",
    productName: "Retail Display Frame",
    itemName: "Ash Veneer",
    itemSubCategory: "Crown Cut",
    colour: "Light Ash",
    length: "2400 mm",
    width: "1180 mm",
    thickness: "0.95 mm",
  },
  {
    groupNo: "GRP-2405",
    customerName: "Urban Form Interiors",
    productName: "Reception Counter Front",
    itemName: "Oak Veneer",
    itemSubCategory: "Rift Cut",
    colour: "Smoked Natural",
    length: "2550 mm",
    width: "1220 mm",
    thickness: "1.15 mm",
  },
  {
    groupNo: "GRP-2406",
    customerName: "Saarthak Woodcraft",
    productName: "Premium Cabinet Fascia",
    itemName: "Walnut Veneer",
    itemSubCategory: "Natural",
    colour: "Classic Walnut",
    length: "2480 mm",
    width: "1230 mm",
    thickness: "1.05 mm",
  },
] as const;

const finishGroups = [
  {
    groupNo: "FIN-3101",
    itemName: "Oak Veneer",
    subCategory: "Quarter Cut",
    color: "Natural Oak",
    length: "2440 mm",
    width: "1220 mm",
    thickness: "1.20 mm",
    finishType: "Matt PU",
  },
  {
    groupNo: "FIN-3102",
    itemName: "Walnut Veneer",
    subCategory: "Crown Cut",
    color: "Dark Walnut",
    length: "2500 mm",
    width: "1200 mm",
    thickness: "1.10 mm",
    finishType: "Gloss PU",
  },
  {
    groupNo: "FIN-3103",
    itemName: "Teak Veneer",
    subCategory: "Natural",
    color: "Golden Brown",
    length: "2700 mm",
    width: "1250 mm",
    thickness: "1.00 mm",
    finishType: "Open Grain",
  },
  {
    groupNo: "FIN-3104",
    itemName: "Ash Veneer",
    subCategory: "Crown Cut",
    color: "Light Ash",
    length: "2400 mm",
    width: "1180 mm",
    thickness: "0.95 mm",
    finishType: "Natural Oil",
  },
  {
    groupNo: "FIN-3105",
    itemName: "Oak Veneer",
    subCategory: "Rift Cut",
    color: "Smoked Natural",
    length: "2550 mm",
    width: "1220 mm",
    thickness: "1.15 mm",
    finishType: "Brushed Matt",
  },
  {
    groupNo: "FIN-3106",
    itemName: "Walnut Veneer",
    subCategory: "Natural",
    color: "Classic Walnut",
    length: "2480 mm",
    width: "1230 mm",
    thickness: "1.05 mm",
    finishType: "Closed Grain",
  },
] as const;

const samplePurposes = [
  "Architect Approval",
  "Client Mockup",
  "Shade Matching",
  "QC Reference",
  "Dispatch Sample",
  "Finish Approval",
] as const;

const createdByCycle = [
  "Atharva Khan",
  "Neha Shah",
  "Rohit Jain",
  "Aditi Desai",
  "Harsh Vora",
  "Vikram Mehta",
] as const;

const slicingRows = createFactoryRows<FactoryRecord>(
  "slicing",
  veneerLots.map((lot, index) => ({
    issueSrNo: `SLC-ISS-2026-00${index + 1}`,
    issueDate: asDate(`2026-06-${String(index + 2).padStart(2, "0")}`),
    palletNo: lot.palletNo,
    supplierName: lot.supplierName,
    itemName: lot.itemName,
    subCategory: lot.subCategory,
    color: lot.color,
    length: lot.length,
    width: lot.width,
    thickness: lot.thickness,
    issuedLeaves: String(42 + index * 3),
    issuedSqm: (118.25 + index * 6.4).toFixed(3),
    shift: ["Morning", "General", "Evening"][index % 3],
    workers: String(14 + index),
    workingHours: `${7.5 + (index % 3) * 0.5}`,
    issuedFor: ["Drying", "Inspection", "Pressing", "Packing", "Sample Sheets", "Drying"][index],
    remark: [
      "Priority inward for next-day drying.",
      "Hold for grain inspection after slicing.",
      "Press-ready lot aligned to order batch.",
      "Packing sample lot created from surplus leaves.",
      "Architect sample request tagged for finishing.",
      "Scheduled for standard drying cycle.",
    ][index],
    createdEditedBy: createdByCycle[index],
    createdEditedDate: asDate(`2026-06-${String(index + 3).padStart(2, "0")}`),
    status: ["Issued", "In Progress", "Issued", "Completed", "Issued", "Completed"][index],
  })),
);

const splicingRows = createFactoryRows<FactoryRecord>(
  "splicing",
  veneerLots.map((lot, index) => ({
    issueSrNo: `SPL-ISS-2026-00${index + 1}`,
    issueDate: asDate(`2026-06-${String(index + 7).padStart(2, "0")}`),
    palletNo: `SPL-${lot.palletNo}`,
    supplierName: lot.supplierName,
    itemName: lot.itemName,
    subCategory: lot.subCategory,
    color: lot.color,
    length: lot.length,
    width: lot.width,
    thickness: lot.thickness,
    issuedLeaves: String(28 + index * 2),
    issuedSqm: (82.4 + index * 5.1).toFixed(3),
    shift: ["Morning", "General", "Evening"][index % 3],
    workers: String(9 + index),
    workingHours: `${6.5 + (index % 2) * 0.5}`,
    issuedFor: ["Pressing", "Marquetry", "Pressing", "Pressing", "Export / OEM", "Pressing"][index],
    remark: [
      "Matched grain sheets aligned for splicing.",
      "Decorative splice pattern queued for marquetry.",
      "Spliced bundle moved to grouping for batch setup.",
      "Production splice lot cleared for pressing.",
      "OEM splice board tagged for export review.",
      "Spliced sheets bundled for grouping stage.",
    ][index],
    createdEditedBy: createdByCycle[index],
    createdEditedDate: asDate(`2026-06-${String(index + 8).padStart(2, "0")}`),
    status: ["Issued", "In Progress", "Issued", "Completed", "Issued", "Completed"][index],
  })),
);

const dryingRows = createFactoryRows<FactoryRecord>(
  "drying",
  veneerLots.map((lot, index) => ({
    issuedFrom: "Slicing",
    issuedDate: asDate(`2026-06-${String(index + 4).padStart(2, "0")}`),
    palletNo: `DRY-${lot.palletNo}`,
    noOfBundle: String(3 + (index % 3)),
    itemName: lot.itemName,
    itemSubCategory: lot.subCategory,
    processDate: asDate(`2026-06-${String(index + 5).padStart(2, "0")}`),
    shift: ["Morning", "General", "Evening"][index % 3],
    workers: String(8 + index),
    noOfWorkingHours: `${6.5 + (index % 2) * 1.0}`,
    noOfTotalHours: `${8.0 + (index % 2) * 1.0}`,
    process: ["Kiln Drying", "Air Drying", "Controlled Drying", "Kiln Drying", "Air Drying", "Controlled Drying"][index],
    processColour: lot.color,
    remark: [
      "Moisture brought within target band.",
      "Extended cycle due to veneer density.",
      "Transferred to QC after evening batch.",
      "Held for colour consistency review.",
      "Batch completed and moved to grouping.",
      "Drying finished for next press sequence.",
    ][index],
  })),
);

const groupingRows = createFactoryRows<FactoryRecord>(
  "grouping",
  productionGroups.map((group, index) => ({
    issuedFor: ["Splicing", "Pressing", "Marquetry", "Splicing", "Pressing", "Sample Sheets"][index],
    issuedDate: asDate(`2026-06-${String(index + 8).padStart(2, "0")}`),
    customerName: group.customerName,
    orderNo: `GR-2026-21${index + 1}`,
    orderItemNo: `GR-ITEM-${index + 1}`,
    productName: group.productName,
    groupNo: group.groupNo,
    itemName: group.itemName,
    itemSubCategory: group.itemSubCategory,
    length: group.length,
    width: group.width,
    thickness: group.thickness,
    noOfSheets: String(20 + index * 2),
    avlNoOfSheets: String(15 + index * 2),
    sqm: (74.2 + index * 4.85).toFixed(3),
    amount: `${(138000 + index * 16200).toLocaleString("en-IN")}.00`,
    colour: group.colour,
    remark: [
      "Grouped by species and order priority.",
      "Production batch grouped ahead of pressing run.",
      "Decorative grouping tagged for marquetry team.",
      "Splicing group aligned with panel allocation.",
      "Grouped panels released to press planning.",
      "OEM grouping held for export specification review.",
    ][index],
    createdEditedBy: createdByCycle[index],
    createdEditedDate: asDate(`2026-06-${String(index + 9).padStart(2, "0")}`),
  })),
);

const pressingRows = createFactoryRows<FactoryRecord>(
  "pressing",
  productionGroups.map((group, index) => ({
    issuedFor: ["Production", "Packing", "CNC / Fluting", "Finishing", "Embossing", "Dispatch"][index],
    issuedDate: asDate(`2026-06-${String(index + 10).padStart(2, "0")}`),
    customerName: group.customerName,
    orderNo: `SO-2026-11${index + 1}`,
    orderItemNo: `ITEM-${index + 1}`,
    productName: group.productName,
    groupNo: group.groupNo,
    itemName: group.itemName,
    itemSubCategory: group.itemSubCategory,
    length: group.length,
    width: group.width,
    thickness: group.thickness,
    noOfSheets: String(24 + index * 2),
    avlNoOfSheets: String(18 + index * 2),
    sqm: (84.4 + index * 5.75).toFixed(3),
    amount: `${(152000 + index * 18450).toLocaleString("en-IN")}.00`,
    colour: group.colour,
    remark: [
      "Press batch locked against customer order.",
      "Waiting for glue curing confirmation.",
      "Released to CNC after initial pressing.",
      "Shifted to finishing for top-coat prep.",
      "Embossing trial approved by QC.",
      "Dispatch-approved pressing lot.",
    ][index],
    createdEditedBy: createdByCycle[index],
    createdEditedDate: asDate(`2026-06-${String(index + 12).padStart(2, "0")}`),
  })),
);

const cncEmbossingRows = createFactoryRows<FactoryRecord>(
  "cnc-embossing",
  productionGroups.map((group, index) => ({
    issuedFor: ["CNC / Fluting", "Embossing", "CNC / Fluting", "Embossing", "CNC / Fluting", "Embossing"][index],
    issuedDate: asDate(`2026-06-${String(index + 14).padStart(2, "0")}`),
    customerName: group.customerName,
    productName: group.productName,
    groupNo: group.groupNo,
    itemName: group.itemName,
    subCategory: group.itemSubCategory,
    length: group.length,
    width: group.width,
    thickess: group.thickness,
    noOfSheets: String(16 + index * 2),
    avlNoOfSheets: String(12 + index * 2),
    sqm: (62.3 + index * 4.4).toFixed(3),
    amount: `${(118500 + index * 16750).toLocaleString("en-IN")}.00`,
    colour: group.colour,
    remark: [
      "Routing template selected for fluting pattern.",
      "Embossing depth approved by design review.",
      "CNC cut file synced with production drawing.",
      "Embossing sample retained for QC archive.",
      "CNC bundle staged for edge finishing.",
      "Embossed batch ready for sample validation.",
    ][index],
    createdEditedBy: createdByCycle[index],
    createdEditedDate: asDate(`2026-06-${String(index + 16).padStart(2, "0")}`),
  })),
);

const marquetryRows = createFactoryRows<FactoryRecord>(
  "marquetry",
  productionGroups.map((group, index) => ({
    issuedFor: ["Marquetry", "Pressing", "Marquetry", "Sample Sheets", "Export / OEM", "Pressing"][index],
    issuedDate: asDate(`2026-06-${String(index + 17).padStart(2, "0")}`),
    customerName: group.customerName,
    productName: group.productName,
    groupNo: `MRQ-${group.groupNo}`,
    itemName: group.itemName,
    subCategory: group.itemSubCategory,
    length: group.length,
    width: group.width,
    thickess: group.thickness,
    noOfSheets: String(14 + index * 2),
    avlNoOfSheets: String(10 + index * 2),
    sqm: (48.6 + index * 3.9).toFixed(3),
    amount: `${(126000 + index * 17100).toLocaleString("en-IN")}.00`,
    colour: group.colour,
    remark: [
      "Chevron marquetry layout approved for assembly.",
      "Pattern-matched batch moved toward finishing prep.",
      "Feature veneer marquetry set staged for bonding.",
      "Marquetry trial lot retained for sample verification.",
      "OEM marquetry panel marked for export selection.",
      "Finished marquetry set aligned for coating stage.",
    ][index],
    createdEditedBy: createdByCycle[index],
    createdEditedDate: asDate(`2026-06-${String(index + 18).padStart(2, "0")}`),
  })),
);

const sampleSheetRows = createFactoryRows<FactoryRecord>(
  "sample-sheets",
  finishGroups.map((group, index) => ({
    sampleSrNo: `SMP-2026-00${index + 1}`,
    sampleDate: asDate(`2026-06-${String(index + 18).padStart(2, "0")}`),
    groupNo: group.groupNo,
    itemName: group.itemName,
    subCategory: group.subCategory,
    color: group.color,
    length: group.length,
    width: group.width,
    thickness: group.thickness,
    sampleSheets: String(4 + (index % 3)),
    sqm: (12.5 + index * 1.2).toFixed(3),
    purpose: samplePurposes[index],
    remark: [
      "Architect approval swatch prepared.",
      "Mockup sample sent to customer team.",
      "Shade board retained for comparison.",
      "QC reference sample tagged and stored.",
      "Dispatch sample prepared with final finish.",
      "Finish approval sample moved to final stage.",
    ][index],
    createdEditedBy: createdByCycle[index],
    createdEditedDate: asDate(`2026-06-${String(index + 19).padStart(2, "0")}`),
  })),
);

const finishingRows = createFactoryRows<FactoryRecord>(
  "finishing",
  finishGroups.map((group, index) => ({
    processDate: asDate(`2026-06-${String(index + 20).padStart(2, "0")}`),
    groupNo: group.groupNo,
    itemName: group.itemName,
    subCategory: group.subCategory,
    color: group.color,
    length: group.length,
    width: group.width,
    thickness: group.thickness,
    finishedSheets: String(18 + index * 2),
    finishedSqm: (58.4 + index * 4.6).toFixed(3),
    finishType: group.finishType,
    shift: ["Morning", "General", "Evening"][index % 3],
    workers: String(10 + index),
    workingHours: `${7.0 + (index % 3) * 0.5}`,
    remark: [
      "Base coat completed and inspected.",
      "Gloss layer pending curing confirmation.",
      "Open grain texture approved by QC.",
      "Natural oil finish applied evenly.",
      "Brushed surface ready for packing review.",
      "Closed grain finish cleared for warehouse.",
    ][index],
    createdEditedBy: createdByCycle[index],
    createdEditedDate: asDate(`2026-06-${String(index + 21).padStart(2, "0")}`),
  })),
);

const exportOemRows = createFactoryRows<FactoryRecord>(
  "export-oem",
  finishGroups.map((group, index) => ({
    processDate: asDate(`2026-06-${String(index + 24).padStart(2, "0")}`),
    groupNo: `EXP-${group.groupNo}`,
    itemName: group.itemName,
    subCategory: group.subCategory,
    color: group.color,
    length: group.length,
    width: group.width,
    thickness: group.thickness,
    finishedSheets: String(12 + index * 2),
    finishedSqm: (44.8 + index * 3.6).toFixed(3),
    finishType: `OEM ${group.finishType}`,
    shift: ["Morning", "General", "Evening"][index % 3],
    workers: String(7 + index),
    workingHours: `${6.0 + (index % 2) * 0.5}`,
    remark: [
      "Export lot packed against overseas grade sheet.",
      "OEM bundle staged for private-label verification.",
      "Surface finish matched to export specification.",
      "Moisture and wrap checked before OEM dispatch hold.",
      "Container allocation note added for export batch.",
      "OEM finish bundle cleared for dispatch planning.",
    ][index],
    createdEditedBy: createdByCycle[index],
    createdEditedDate: asDate(`2026-06-${String(index + 25).padStart(2, "0")}`),
  })),
);

const slicingColumns = [
  column("issueSrNo", "Issue Sr No"),
  column("issueDate", "Issue Date"),
  column("palletNo", "Pallet No"),
  // column("supplierName", "Supplier Name"),
  column("itemName", "Item Name"),
  column("subCategory", "Sub Category"),
  column("color", "Color"),
  column("length", "Length"),
  column("width", "Width"),
  column("thickness", "Thickness"),
  column("issuedLeaves", "Issued Leaves"),
  column("issuedSqm", "Issued SQM"),
  column("shift", "Shift"),
  column("workers", "Workers"),
  column("workingHours", "Working Hours"),
  column("remark", "Remark"),
  column("createdEditedBy", "Created / Edited By"),
  column("createdEditedDate", "Created / Edited Date"),
  column("status", "Status"),
] as const satisfies readonly EnterpriseTableColumn<FactoryRecord>[];

const dryingColumns = [
  column("issuedFrom", "Issued From"),
  column("issuedDate", "issued Date"),
  column("palletNo", "Pallet No"),
  column("noOfBundle", "No of Bundles"),
  column("itemName", "Item Name"),
  column("itemSubCategory", "Item Sub Category"),
] as const satisfies readonly EnterpriseTableColumn<FactoryRecord>[];

const pressingColumns = [
  column("issuedFor", "Issued for"),
  column("issuedDate", "issued date"),
  column("customerName", "Customer Name"),
  column("orderNo", "Order No"),
  column("orderItemNo", "Order Item No"),
  column("productName", "Product Name"),
  column("groupNo", "Group No"),
  column("itemName", "Item Name"),
  column("itemSubCategory", "Item Sub Category"),
  column("length", "Length"),
  column("width", "Width"),
  column("thickness", "Thickness"),
  column("noOfSheets", "No of Sheets"),
  column("avlNoOfSheets", "Avl No of Sheets"),
  column("sqm", "SQM"),
  column("amount", "Amount"),
  column("colour", "Colour"),
  column("remark", "Remark"),
  column("createdEditedBy", "Created / Edited By"),
  column("createdEditedDate", "Created / Edited Date"),
] as const satisfies readonly EnterpriseTableColumn<FactoryRecord>[];

const cncEmbossingColumns = [
  column("issuedFor", "Issued for"),
  column("issuedDate", "Issued Date"),
  column("customerName", "Customer Name"),
  column("productName", "Product Name"),
  column("groupNo", "Group No"),
  column("itemName", "Item Name"),
  column("subCategory", "Sub Category"),
  column("length", "Length"),
  column("width", "Width"),
  column("thickness", "Thickness"),
  column("noOfSheets", "No of Sheets"),
  column("avlNoOfSheets", "Avl No of Sheets"),
  column("sqm", "SQM"),
  column("amount", "Amount"),
  column("colour", "Colour"),
  column("remark", "Remark"),
  column("createdEditedBy", "Created / Edited By"),
  column("createdEditedDate", "Created / Edited Date"),
] as const satisfies readonly EnterpriseTableColumn<FactoryRecord>[];

const sampleSheetColumns = [
  column("sampleSrNo", "Sample Sr No"),
  column("sampleDate", "Sample Date"),
  column("groupNo", "Group No"),
  column("itemName", "Item Name"),
  column("subCategory", "Sub Category"),
  column("color", "Color"),
  column("length", "Length"),
  column("width", "Width"),
  column("thickness", "Thickness"),
  column("sampleSheets", "Sample Sheets"),
  column("sqm", "SQM"),
  column("purpose", "Purpose"),
  column("remark", "Remark"),
  column("createdEditedBy", "Created / Edited By"),
  column("createdEditedDate", "Created / Edited Date"),
] as const satisfies readonly EnterpriseTableColumn<FactoryRecord>[];

const finishingColumns = [
  column("processDate", "Process Date"),
  column("groupNo", "Group No"),
  column("itemName", "Item Name"),
  column("subCategory", "Sub Category"),
  column("color", "Color"),
  column("length", "Length"),
  column("width", "Width"),
  column("thickness", "Thickness"),
  column("finishedSheets", "Finished Sheets"),
  column("finishedSqm", "Finished SQM"),
  column("finishType", "Finish Type"),
  column("shift", "Shift"),
  column("workers", "Workers"),
  column("workingHours", "Working Hours"),
  column("remark", "Remark"),
  column("createdEditedBy", "Created / Edited By"),
  column("createdEditedDate", "Created / Edited Date"),
] as const satisfies readonly EnterpriseTableColumn<FactoryRecord>[];

const slicingSections = [
  createSection("Process Details", [
    dateField("issueDate", "Issue Date"),
    textField("palletNo", "Pallet No"),
    selectField("supplierName", "Supplier Name", slicingRows),
    selectField("issuedFor", "Issued for", slicingRows),
  ]),
  createSection("Material Details", [
    selectField("itemName", "Item Name", slicingRows),
    selectField("subCategory", "Sub Category", slicingRows),
    selectField("color", "Color", slicingRows),
    textField("length", "Length"),
    textField("width", "Width"),
    textField("thickness", "Thickness"),
  ]),
  createSection("Machine Details", [
    selectField("shift", "Shift", slicingRows),
    textField("workers", "Workers"),
    textField("workingHours", "Working Hours"),
  ]),
  createSection("Production Details", [
    textField("issuedLeaves", "Issued Leaves"),
    textField("issuedSqm", "Issued SQM"),
  ]),
  createSection("Remarks", [remarkField()]),
] as const;

const dryingSections = [
  createSection("Process Details", [
    dateField("processDate", "Process date"),
    selectField("process", "Process", dryingRows),
    selectField("processColour", "Process Colour", dryingRows),
    textField("palletNo", "Pallet No"),
  ]),
  createSection("Machine Details", [
    selectField("shift", "Shift", dryingRows),
    textField("workers", "Workers"),
    textField("noOfWorkingHours", "No. of Working Hours"),
    textField("noOfTotalHours", "No. of Total Hours"),
  ]),
  createSection("Remarks", [remarkField()]),
] as const;

const groupingSections = [
  createSection("Process Details", [
    selectField("issuedFor", "Issued for", groupingRows),
    dateField("issuedDate", "Issued Date"),
    selectField("customerName", "Customer Name", groupingRows),
    textField("orderNo", "Order No"),
    textField("orderItemNo", "Order Item No"),
    selectField("productName", "Product Name", groupingRows),
    textField("groupNo", "Group No"),
  ]),
  createSection("Material Details", [
    selectField("itemName", "Item Name", groupingRows),
    selectField("itemSubCategory", "Item Sub Category", groupingRows),
    selectField("colour", "Colour", groupingRows),
    textField("length", "Length"),
    textField("width", "Width"),
    textField("thickness", "Thickness"),
  ]),
  createSection("Production Details", [
    textField("noOfSheets", "No. of Sheets"),
    textField("avlNoOfSheets", "Avl. No. of Sheets"),
    textField("sqm", "SQM"),
    textField("amount", "Amount"),
  ]),
  createSection("Remarks", [remarkField()]),
] as const;

const pressingSections = [
  createSection("Process Details", [
    selectField("issuedFor", "Issued for", pressingRows),
    dateField("issuedDate", "Issued Date"),
    selectField("customerName", "Customer Name", pressingRows),
    textField("orderNo", "Order No"),
    textField("orderItemNo", "Order Item No"),
    selectField("productName", "Product Name", pressingRows),
    textField("groupNo", "Group No"),
  ]),
  createSection("Material Details", [
    selectField("itemName", "Item Name", pressingRows),
    selectField("itemSubCategory", "Item Sub Category", pressingRows),
    selectField("colour", "Colour", pressingRows),
    textField("length", "Length"),
    textField("width", "Width"),
    textField("thickness", "Thickness"),
  ]),
  createSection("Production Details", [
    textField("noOfSheets", "No. of Sheets"),
    textField("avlNoOfSheets", "Avl. No. of Sheets"),
    textField("sqm", "SQM"),
    textField("amount", "Amount"),
  ]),
  createSection("Remarks", [remarkField()]),
] as const;

const splicingSections = [
  createSection("Process Details", [
    dateField("issueDate", "Issue Date"),
    textField("palletNo", "Pallet No"),
    selectField("supplierName", "Supplier Name", splicingRows),
    selectField("issuedFor", "Issued for", splicingRows),
  ]),
  createSection("Material Details", [
    selectField("itemName", "Item Name", splicingRows),
    selectField("subCategory", "Sub Category", splicingRows),
    selectField("color", "Color", splicingRows),
    textField("length", "Length"),
    textField("width", "Width"),
    textField("thickness", "Thickness"),
  ]),
  createSection("Machine Details", [
    selectField("shift", "Shift", splicingRows),
    textField("workers", "Workers"),
    textField("workingHours", "Working Hours"),
  ]),
  createSection("Production Details", [
    textField("issuedLeaves", "Issued Leaves"),
    textField("issuedSqm", "Issued SQM"),
  ]),
  createSection("Remarks", [remarkField()]),
] as const;

const cncEmbossingSections = [
  createSection("Process Details", [
    selectField("issuedFor", "Issued for", cncEmbossingRows),
    dateField("issuedDate", "Issued Date"),
    selectField("customerName", "Customer Name", cncEmbossingRows),
    selectField("productName", "Product Name", cncEmbossingRows),
    textField("groupNo", "Group No"),
  ]),
  createSection("Material Details", [
    selectField("itemName", "Item Name", cncEmbossingRows),
    selectField("subCategory", "Sub Category", cncEmbossingRows),
    selectField("colour", "Colour", cncEmbossingRows),
    textField("length", "Length"),
    textField("width", "Width"),
    textField("thickess", "Thickness"),
  ]),
  createSection("Production Details", [
    textField("noOfSheets", "No. of Sheets"),
    textField("avlNoOfSheets", "Avl. No. of Sheets"),
    textField("sqm", "SQM"),
    textField("amount", "Amount"),
  ]),
  createSection("Remarks", [remarkField()]),
] as const;

const marquetrySections = [
  createSection("Process Details", [
    selectField("issuedFor", "Issued for", marquetryRows),
    dateField("issuedDate", "Issued Date"),
    selectField("customerName", "Customer Name", marquetryRows),
    selectField("productName", "Product Name", marquetryRows),
    textField("groupNo", "Group No"),
  ]),
  createSection("Material Details", [
    selectField("itemName", "Item Name", marquetryRows),
    selectField("subCategory", "Sub Category", marquetryRows),
    selectField("colour", "Colour", marquetryRows),
    textField("length", "Length"),
    textField("width", "Width"),
    textField("thickess", "Thickness"),
  ]),
  createSection("Production Details", [
    textField("noOfSheets", "No. of Sheets"),
    textField("avlNoOfSheets", "Avl. No. of Sheets"),
    textField("sqm", "SQM"),
    textField("amount", "Amount"),
  ]),
  createSection("Remarks", [remarkField()]),
] as const;

const sampleSheetSections = [
  createSection("Process Details", [
    textField("sampleSrNo", "Sample Sr No"),
    dateField("sampleDate", "Sample Date"),
    textField("groupNo", "Group No"),
    selectField("purpose", "Purpose", sampleSheetRows),
  ]),
  createSection("Material Details", [
    selectField("itemName", "Item Name", sampleSheetRows),
    selectField("subCategory", "Sub Category", sampleSheetRows),
    selectField("color", "Color", sampleSheetRows),
    textField("length", "Length"),
    textField("width", "Width"),
    textField("thickness", "Thickness"),
  ]),
  createSection("Production Details", [
    textField("sampleSheets", "Sample Sheets"),
    textField("sqm", "SQM"),
  ]),
  createSection("Remarks", [remarkField()]),
] as const;

const finishingSections = [
  createSection("Process Details", [
    dateField("processDate", "Process Date"),
    textField("groupNo", "Group No"),
    selectField("finishType", "Finish Type", finishingRows),
  ]),
  createSection("Material Details", [
    selectField("itemName", "Item Name", finishingRows),
    selectField("subCategory", "Sub Category", finishingRows),
    selectField("color", "Color", finishingRows),
    textField("length", "Length"),
    textField("width", "Width"),
    textField("thickness", "Thickness"),
  ]),
  createSection("Machine Details", [
    selectField("shift", "Shift", finishingRows),
    textField("workers", "Workers"),
    textField("workingHours", "Working Hours"),
  ]),
  createSection("Production Details", [
    textField("finishedSheets", "Finished Sheets"),
    textField("finishedSqm", "Finished SQM"),
  ]),
  createSection("Remarks", [remarkField()]),
] as const;

const exportOemSections = [
  createSection("Process Details", [
    dateField("processDate", "Process Date"),
    textField("groupNo", "Group No"),
    selectField("finishType", "Finish Type", exportOemRows),
  ]),
  createSection("Material Details", [
    selectField("itemName", "Item Name", exportOemRows),
    selectField("subCategory", "Sub Category", exportOemRows),
    selectField("color", "Color", exportOemRows),
    textField("length", "Length"),
    textField("width", "Width"),
    textField("thickness", "Thickness"),
  ]),
  createSection("Machine Details", [
    selectField("shift", "Shift", exportOemRows),
    textField("workers", "Workers"),
    textField("workingHours", "Working Hours"),
  ]),
  createSection("Production Details", [
    textField("finishedSheets", "Finished Sheets"),
    textField("finishedSqm", "Finished SQM"),
  ]),
  createSection("Remarks", [remarkField()]),
] as const;

export const slicingDefinition: FactoryDefinition = {
  slug: "slicing",
  title: "Slicing",
  listColumns: slicingColumns,
  formSections: slicingSections,
  rows: expandFactoryRowsForTabs("slicing", slicingRows),
  initialSort: { key: "issueDate", direction: "desc" },
};

export const dryingDefinition: FactoryDefinition = {
  slug: "drying",
  title: "Drying",
  listColumns: dryingColumns,
  formSections: dryingSections,
  rows: expandFactoryRowsForTabs("drying", dryingRows),
  initialSort: { key: "issuedDate", direction: "desc" },
};

export const groupingDefinition: FactoryDefinition = {
  slug: "grouping",
  title: "Grouping",
  listColumns: pressingColumns,
  formSections: groupingSections,
  rows: expandFactoryRowsForTabs("grouping", groupingRows),
  initialSort: { key: "issuedDate", direction: "desc" },
};

export const pressingDefinition: FactoryDefinition = {
  slug: "pressing",
  title: "Pressing",
  listColumns: pressingColumns,
  formSections: pressingSections,
  rows: expandFactoryRowsForTabs("pressing", pressingRows),
  initialSort: { key: "issuedDate", direction: "desc" },
};

export const splicingDefinition: FactoryDefinition = {
  slug: "splicing",
  title: "Splicing",
  listColumns: slicingColumns,
  formSections: splicingSections,
  rows: expandFactoryRowsForTabs("splicing", splicingRows),
  initialSort: { key: "issueDate", direction: "desc" },
};

export const finishingDefinition: FactoryDefinition = {
  slug: "finishing",
  title: "Finishing",
  listColumns: finishingColumns,
  formSections: finishingSections,
  rows: expandFactoryRowsForTabs("finishing", finishingRows),
  initialSort: { key: "processDate", direction: "desc" },
};

export const cncFlutingDefinition: FactoryDefinition = {
  slug: "cnc-fluting",
  title: "CNC / Fluting",
  listColumns: cncEmbossingColumns,
  formSections: cncEmbossingSections,
  rows: expandFactoryRowsForTabs(
    "cnc-fluting",
    cncEmbossingRows.map((row, index) => ({
      ...row,
      id: `cnc-fluting-${index + 1}`,
      issuedFor: "CNC / Fluting",
      remark: [
        "Routing template selected for fluting pattern.",
        "CNC notch alignment reviewed by production.",
        "Panel staged for secondary edge cleanup.",
        "Machine offsets verified before batch run.",
        "Fluted lot held for dimensional validation.",
        "CNC lot moved to embossing-ready stage.",
      ][index],
    })),
  ),
  initialSort: { key: "issuedDate", direction: "desc" },
};

export const embossingDefinition: FactoryDefinition = {
  slug: "embossing",
  title: "Embossing",
  listColumns: cncEmbossingColumns,
  formSections: cncEmbossingSections,
  rows: expandFactoryRowsForTabs(
    "embossing",
    cncEmbossingRows.map((row, index) => ({
      ...row,
      id: `embossing-${index + 1}`,
      issuedFor: "Embossing",
      remark: [
        "Embossing depth approved by design review.",
        "Texture pattern matched against approved board.",
        "Embossed batch retained for QC surface check.",
        "Press alignment recalibrated for next bundle.",
        "Embossed lot cleared for sample preparation.",
        "Final embossed batch ready for finish approval.",
      ][index],
    })),
  ),
  initialSort: { key: "issuedDate", direction: "desc" },
};

export const sampleSheetsDefinition: FactoryDefinition = {
  slug: "sample-sheets",
  title: "Sample Sheets",
  listColumns: sampleSheetColumns,
  formSections: sampleSheetSections,
  rows: expandFactoryRowsForTabs("sample-sheets", sampleSheetRows),
  initialSort: { key: "sampleDate", direction: "desc" },
};

export const exportOemDefinition: FactoryDefinition = {
  slug: "export-oem",
  title: "Export / OEM",
  listColumns: finishingColumns,
  formSections: exportOemSections,
  rows: expandFactoryRowsForTabs("export-oem", exportOemRows),
  initialSort: { key: "processDate", direction: "desc" },
};

export const marquetryDefinition: FactoryDefinition = {
  slug: "marquetry",
  title: "Marquetry",
  listColumns: cncEmbossingColumns,
  formSections: marquetrySections,
  rows: expandFactoryRowsForTabs("marquetry", marquetryRows),
  initialSort: { key: "issuedDate", direction: "desc" },
};
