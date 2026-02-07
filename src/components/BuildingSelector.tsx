import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building } from "@/lib/mockData";

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
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-foreground">Building:</label>
      <Select value={selectedBuildingId} onValueChange={onSelect}>
        <SelectTrigger className="w-[320px] bg-card">
          <SelectValue placeholder="Select a building" />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          {buildings.map((building) => (
            <SelectItem key={String(building.building_id)} value={String(building.building_id)}>
              {building.building_name} — {building.campusname}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
