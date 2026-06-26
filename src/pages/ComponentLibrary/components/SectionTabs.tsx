import { Box, Tab, Tabs } from "@mui/material";

type SectionTabsProps<TTab extends string> = {
  activeTab: TTab;
  tabs: ReadonlyArray<{
    label: string;
    value: TTab;
  }>;
  onChange: (value: TTab) => void;
};

export function SectionTabs<TTab extends string>({
  activeTab,
  tabs,
  onChange,
}: SectionTabsProps<TTab>) {
  return (
    <Box
      sx={(theme) => ({
        borderBottom: `1px solid ${theme.customTokens.borders.subtle}`,
      })}
    >
      <Tabs
        allowScrollButtonsMobile
        onChange={(_, value: TTab) => onChange(value)}
        scrollButtons="auto"
        value={activeTab}
        variant="scrollable"
        sx={(theme) => ({
          minHeight: theme.spacing(6),
          "& .MuiTabs-indicator": {
            height: theme.customTokens.navigation.indicatorWidth,
            borderRadius: `${theme.customTokens.radius.pill}px`,
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
              px: theme.spacing(2),
              py: theme.spacing(1),
              mr: theme.spacing(1),
              borderRadius: `${theme.customTokens.radius.md}px ${theme.customTokens.radius.md}px 0 0`,
              color: theme.customTokens.navigation.inactiveText,
              fontFamily: theme.typography.fontFamily,
              fontSize: theme.typography.body2.fontSize,
              fontWeight: 500,
              lineHeight: theme.typography.body2.lineHeight,
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
                fontWeight: 600,
              },
            })}
          />
        ))}
      </Tabs>
    </Box>
  );
}
