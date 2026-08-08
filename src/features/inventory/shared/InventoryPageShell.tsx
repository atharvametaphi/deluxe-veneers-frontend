import type { LucideIcon } from "lucide-react";
import { Warehouse } from "lucide-react";
import type { PropsWithChildren, ReactNode } from "react";
import { Stack } from "@mui/material";

import type { ErpBreadcrumbItem } from "../../../components/navigation/ErpBreadcrumbs";
import type { PageHeaderBackNav } from "../../../components/navigation/PageHeader";
import { MasterPageShell } from "../../masters/shared";

interface InventoryPageShellProps extends PropsWithChildren {
  actions?: ReactNode;
  backNav?: PageHeaderBackNav | null;
  breadcrumbs?: ErpBreadcrumbItem[];
  icon?: LucideIcon;
  processTabs?: ReactNode;
  subtitle?: string;
  title: string;
}

export function InventoryPageShell({
  actions,
  backNav,
  breadcrumbs = [],
  children,
  icon = Warehouse,
  processTabs,
  subtitle,
  title,
}: InventoryPageShellProps) {
  return (
    <MasterPageShell
      actions={actions}
      backNav={backNav}
      breadcrumbs={breadcrumbs}
      contentGap={processTabs ? 0 : 2}
      icon={icon}
      subtitle={subtitle}
      title={title}
    >
      <Stack
        sx={(theme) => ({
          gap: processTabs ? theme.spacing(1.5) : theme.spacing(2),
        })}
      >
        {processTabs}

        {children}
      </Stack>
    </MasterPageShell>
  );
}
