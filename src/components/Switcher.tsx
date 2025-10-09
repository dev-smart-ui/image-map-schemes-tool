import { Button } from "./ui/buttons/Button";

export const Switcher = ({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: {
    key: string, 
    label: string
  }[],
  activeTab: string,
  onTabChange: (tab: string) => void
}) => {
  return (
    <div className="flex justify-center mb-2">
      <div className="inline-flex border border-[var(--blue-color)] rounded-full overflow-hidden bg-[var(--secondary-color)]">
        {tabs.map((tab) => (
          <Button 
            key={tab.key}
            className="rounded-none"
            type={activeTab === tab.key ? 'default' : 'secondary'}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
