import { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { Plus, Trash2 } from "lucide-react";

import { recordFormActionButtonSx } from "../../../shared/buttonStyles";
import { getCompactFieldSx } from "../../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";

interface SupplierContactPerson {
  contactPersonName: string;
  designation: string;
  email: string;
  phoneNumber: string;
}

const contactColumns: Array<{
  key: keyof SupplierContactPerson;
  label: string;
  placeholder: string;
}> = [
  {
    key: "contactPersonName",
    label: "Contact Person Name",
    placeholder: "Enter Contact Person Name",
  },
  {
    key: "email",
    label: "Email",
    placeholder: "Enter Email",
  },
  {
    key: "phoneNumber",
    label: "Phone Number",
    placeholder: "Enter Phone Number",
  },
  {
    key: "designation",
    label: "Designation",
    placeholder: "Enter Designation",
  },
];

const emptyContact: SupplierContactPerson = {
  contactPersonName: "",
  designation: "",
  email: "",
  phoneNumber: "",
};

export function SupplierContactPersonTable() {
  const theme = useTheme();
  const [draftContact, setDraftContact] =
    useState<SupplierContactPerson>(emptyContact);
  const [contacts, setContacts] = useState<SupplierContactPerson[]>([]);

  const canAddContact = Object.values(draftContact).some(
    (value) => value.trim().length > 0,
  );

  const handleAddContact = () => {
    if (!canAddContact) {
      return;
    }

    setContacts((current) => [...current, draftContact]);
    setDraftContact(emptyContact);
  };

  return (
    <Stack
      sx={(currentTheme) => ({
        gap: currentTheme.spacing(1.5),
      })}
    >
      <Typography variant="h3" color="text.primary">
        Contact Person Details
      </Typography>

      <Box
        sx={{
          border: `1px solid ${theme.customTokens.borders.default}`,
          borderRadius: `${theme.customTokens.radius.md}px`,
          overflowX: "auto",
          scrollbarColor: `${theme.customTokens.brand.primary} ${theme.customTokens.surfaces.alt}`,
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": {
            height: 6,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: theme.customTokens.surfaces.alt,
            borderRadius: 999,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: theme.customTokens.brand.primary,
            borderRadius: 999,
          },
        }}
      >
        <Table
          size="small"
          sx={{
            minWidth: 860,
            tableLayout: "fixed",
            "& th": {
              backgroundColor: theme.customTokens.brand.primary,
              borderColor: theme.customTokens.brand.primary,
              color: theme.customTokens.text.inverse,
              fontSize: theme.typography.caption.fontSize,
              fontWeight: 700,
              py: 1,
            },
            "& td": {
              borderColor: theme.customTokens.borders.divider,
              py: 1,
              verticalAlign: "middle",
            },
          }}
        >
          <TableHead>
            <TableRow>
              {contactColumns.map((column) => (
                <TableCell key={column.key}>{column.label}</TableCell>
              ))}
              <TableCell width={96}>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            <TableRow>
              {contactColumns.map((column) => (
                <TableCell key={column.key}>
                  <TextField
                    fullWidth
                    value={draftContact[column.key]}
                    onChange={(event) =>
                      setDraftContact((current) => ({
                        ...current,
                        [column.key]: event.target.value,
                      }))
                    }
                    sx={getCompactFieldSx(theme, "default")}
                  />
                </TableCell>
              ))}
              <TableCell>
                <Button
                  disabled={!canAddContact}
                  onClick={handleAddContact}
                  startIcon={<Plus size={14} />}
                  sx={recordFormActionButtonSx}
                  type="button"
                  variant="contained"
                >
                  Add
                </Button>
              </TableCell>
            </TableRow>

            {contacts.map((contact, index) => (
              <TableRow key={`${contact.contactPersonName}-${index}`}>
                {contactColumns.map((column) => (
                  <TableCell key={column.key}>{contact[column.key]}</TableCell>
                ))}
                <TableCell>
                  <IconButton
                    aria-label="Remove contact person"
                    onClick={() =>
                      setContacts((current) =>
                        current.filter((_, contactIndex) => contactIndex !== index),
                      )
                    }
                    size="small"
                    sx={{
                      color: theme.palette.error.main,
                    }}
                  >
                    <Trash2 size={15} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Stack>
  );
}
