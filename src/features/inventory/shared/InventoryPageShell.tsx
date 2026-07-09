import type { PropsWithChildren, ReactNode } from "react";
import { Stack, Typography } from "@mui/material";

import type { ErpBreadcrumbItem } from "../../../components/navigation/ErpBreadcrumbs";
import { MasterPageShell } from "../../masters/shared";

interface InventoryPageShellProps extends PropsWithChildren {
  actions?: ReactNode;
  breadcrumbs: ErpBreadcrumbItem[];
  processTabs?: ReactNode;
  subtitle?: string;
  title: string;
}

export function InventoryPageShell({
  actions,
  breadcrumbs,
  children,
  processTabs,
  subtitle,
  title,
}: InventoryPageShellProps) {
  return (
    <MasterPageShell
      actions={actions}
      breadcrumbs={breadcrumbs}
      contentGap={processTabs ? 0 : 3}
      title={title}
    >
      <Stack
        sx={(theme) => ({
          gap: processTabs && !subtitle ? theme.spacing(2) : theme.spacing(3),
        })}
      >
        {subtitle ? (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        ) : null}

        {processTabs}

        {children}
      </Stack>
    </MasterPageShell>
  );
}
