import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Building } from "@/lib/mockData";
import { isExcludedBuilding } from "@/lib/buildingExclusions";

interface BuildingSelectorProps {
  buildings: Building[];
  selectedBuildingId: string;
  onSelect: (buildingId: string) => void;
}

export function BuildingSelector({
  buildings,
  selectedBuildingId,
  onSelect,
}: BuildingSelectorProps) {
  const [open, setOpen] = useState(false);

  // Filter out buildings with no data
  const filteredBuildings = buildings.filter((b) => !isExcludedBuilding(b));

  const selectedBuilding = filteredBuildings.find(
    (b) => String(b.building_id) === selectedBuildingId
  );

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-foreground">Building:</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="min-w-[200px] justify-between bg-card"
          >
            {selectedBuilding
              ? `${selectedBuilding.building_name} — ${selectedBuilding.campusname}`
              : "Select a building..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0 bg-popover border-border z-50">
          <Command>
            <CommandInput placeholder="Search buildings..." />
            <CommandList>
              <CommandEmpty>No building found.</CommandEmpty>
              <CommandGroup>
                {filteredBuildings.map((building) => (
                  <CommandItem
                    key={String(building.building_id)}
                    value={`${building.building_name} ${building.campusname}`}
                    onSelect={() => {
                      onSelect(String(building.building_id));
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedBuildingId === String(building.building_id)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {building.building_name} — {building.campusname}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
