import { Box, Tab, Tabs } from "@mui/material";

type ModuleProcessTab<TValue extends string> = {
  label: string;
  value: TValue;
};

interface ModuleProcessTabsProps<TValue extends string> {
  onChange: (value: TValue) => void;
  tabs: readonly ModuleProcessTab<TValue>[];
  value: TValue;
}

export function ModuleProcessTabs<TValue extends string>({
  onChange,
  tabs,
  value,
}: ModuleProcessTabsProps<TValue>) {
  return (
    <Box
      sx={(theme) => ({
        borderBottom: `1px solid ${theme.customTokens.borders.divider}`,
      })}
    >
      <Tabs
        allowScrollButtonsMobile
        onChange={(_, nextValue: TValue) => onChange(nextValue)}
        scrollButtons="auto"
        value={value}
        variant="scrollable"
        sx={(theme) => ({
          minHeight: theme.spacing(6),
          "& .MuiTabs-indicator": {
            height: 3,
            borderRadius: `${theme.customTokens.radius.pill}px ${theme.customTokens.radius.pill}px 0 0`,
            backgroundColor: theme.customTokens.navigation.activeIndicator,
          },
        })}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            disableRipple
            label={tab.label}
            value={tab.value}
            sx={(theme) => ({
              minHeight: theme.spacing(6),
              minWidth: "auto",
              px: theme.spacing(1.5),
              py: theme.spacing(1.25),
              mr: theme.spacing(2),
              borderRadius: `${theme.customTokens.radius.md}px ${theme.customTokens.radius.md}px 0 0`,
              color: theme.customTokens.navigation.inactiveText,
              fontFamily: theme.typography.fontFamily,
              fontSize: theme.typography.subtitle2.fontSize,
              fontWeight: 600,
              lineHeight: theme.typography.subtitle2.lineHeight,
              textTransform: "none",
              transition: theme.transitions.create(
                ["background-color", "color"],
                {
                  duration: theme.transitions.duration.shorter,
                },
              ),
              "&:hover": {
                backgroundColor: theme.customTokens.navigation.hoverBackground,
                color: theme.customTokens.navigation.activeText,
              },
              "&.Mui-selected": {
                color: theme.customTokens.navigation.activeText,
                fontWeight: 700,
              },
            })}
          />
        ))}
      </Tabs>
    </Box>
  );
}
