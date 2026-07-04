import type { PropsWithChildren, ReactNode } from "react";
import { Stack, Typography } from "@mui/material";

import type { ErpBreadcrumbItem } from "../../../components/navigation/ErpBreadcrumbs";
import { MasterPageShell } from "../../masters/shared";

interface FactoryPageShellProps extends PropsWithChildren {
  actions?: ReactNode;
  breadcrumbs: ErpBreadcrumbItem[];
  processTabs?: ReactNode;
  subtitle?: string;
  title: string;
}

export function FactoryPageShell({
  actions,
  breadcrumbs,
  children,
  processTabs,
  subtitle,
  title,
}: FactoryPageShellProps) {
  return (
    <MasterPageShell
      actions={actions}
      breadcrumbs={breadcrumbs}
      title={title}
    >
      <Stack
        sx={(theme) => ({
          gap: theme.spacing(3),
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
