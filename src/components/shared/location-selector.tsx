"use client";

import { useCallback } from "react";
import type { Location } from "@/lib/types/common.types";
import {
  getSystemNames,
  getBodyNames,
  getSublocationNames,
} from "@/lib/constants/locations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LocationSelectorProps {
  value: Location;
  onChange: (loc: Location) => void;
}

export function LocationSelector({ value, onChange }: LocationSelectorProps) {
  const systems = getSystemNames();
  const bodies = value.system ? getBodyNames(value.system) : [];
  const sublocations =
    value.system && value.body
      ? getSublocationNames(value.system, value.body)
      : [];

  const handleChange = useCallback(
    (field: keyof Location, val: string) => {
      const updated = { ...value, [field]: val };
      // Clear downstream fields when parent changes
      if (field === "system") {
        updated.body = "";
        updated.sublocation = "";
        updated.detail = "";
      } else if (field === "body") {
        updated.sublocation = "";
        updated.detail = "";
      }
      onChange(updated);
    },
    [value, onChange]
  );

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <Label className="text-xs mb-1 block">System</Label>
        <Input
          list="systems-list"
          value={value.system}
          onChange={(e) => handleChange("system", e.target.value)}
          placeholder="System..."
        />
        <datalist id="systems-list">
          {systems.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>
      <div>
        <Label className="text-xs mb-1 block">Body</Label>
        <Input
          list="bodies-list"
          value={value.body}
          onChange={(e) => handleChange("body", e.target.value)}
          placeholder="Planet/Moon..."
        />
        <datalist id="bodies-list">
          {bodies.map((b) => (
            <option key={b} value={b} />
          ))}
        </datalist>
      </div>
      <div>
        <Label className="text-xs mb-1 block">Location</Label>
        <Input
          list="sublocations-list"
          value={value.sublocation}
          onChange={(e) => handleChange("sublocation", e.target.value)}
          placeholder="Station/City..."
        />
        <datalist id="sublocations-list">
          {sublocations.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>
      <div>
        <Label className="text-xs mb-1 block">Detail (optional)</Label>
        <Input
          value={value.detail || ""}
          onChange={(e) => handleChange("detail", e.target.value)}
          placeholder="Hangar, shop..."
        />
      </div>
    </div>
  );
}
