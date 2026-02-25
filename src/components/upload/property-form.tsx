"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface PropertyFormData {
  address: string;
  postalCode: string;
  city: string;
  price: string;
  squareMeters: string;
  rooms: string;
  bedrooms: string;
  bathrooms: string;
  buildYear: string;
  energyLabel: string;
}

export const emptyFormData: PropertyFormData = {
  address: "",
  postalCode: "",
  city: "",
  price: "",
  squareMeters: "",
  rooms: "",
  bedrooms: "",
  bathrooms: "",
  buildYear: "",
  energyLabel: "",
};

interface PropertyFormProps {
  data: PropertyFormData;
  onChange: (data: PropertyFormData) => void;
}

const fields: {
  key: keyof PropertyFormData;
  label: string;
  type: string;
  placeholder: string;
  half?: boolean;
}[] = [
  { key: "address", label: "Adres", type: "text", placeholder: "Keizersgracht 482" },
  { key: "postalCode", label: "Postcode", type: "text", placeholder: "1017 EG", half: true },
  { key: "city", label: "Plaats", type: "text", placeholder: "Amsterdam", half: true },
  { key: "price", label: "Vraagprijs", type: "number", placeholder: "845000" },
  { key: "squareMeters", label: "Woonoppervlak (m\u00B2)", type: "number", placeholder: "142", half: true },
  { key: "rooms", label: "Kamers", type: "number", placeholder: "5", half: true },
  { key: "bedrooms", label: "Slaapkamers", type: "number", placeholder: "3", half: true },
  { key: "bathrooms", label: "Badkamers", type: "number", placeholder: "2", half: true },
  { key: "buildYear", label: "Bouwjaar", type: "number", placeholder: "1890", half: true },
  { key: "energyLabel", label: "Energielabel", type: "text", placeholder: "A", half: true },
];

export function PropertyForm({ data, onChange }: PropertyFormProps) {
  function handleChange(key: keyof PropertyFormData, value: string) {
    onChange({ ...data, [key]: value });
  }

  // Group fields: full-width fields stand alone, half-width fields pair up
  const rows: (typeof fields[number] | [typeof fields[number], typeof fields[number]])[] = [];
  let i = 0;
  while (i < fields.length) {
    const field = fields[i];
    if (field.half && i + 1 < fields.length && fields[i + 1].half) {
      rows.push([field, fields[i + 1]]);
      i += 2;
    } else {
      rows.push(field);
      i += 1;
    }
  }

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      {rows.map((row) => {
        if (Array.isArray(row)) {
          return (
            <div key={`${row[0].key}-${row[1].key}`} className="grid grid-cols-2 gap-[var(--space-3)]">
              {row.map((field) => (
                <div key={field.key} className="flex flex-col gap-[var(--space-1)]">
                  <Label
                    htmlFor={`field-${field.key}`}
                    className="text-[13px] font-medium tracking-[0.01em] text-[var(--ink-secondary)]"
                  >
                    {field.label}
                  </Label>
                  <Input
                    id={`field-${field.key}`}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={data[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="bg-[var(--surface-2)]"
                  />
                </div>
              ))}
            </div>
          );
        }

        const field = row;
        return (
          <div key={field.key} className="flex flex-col gap-[var(--space-1)]">
            <Label
              htmlFor={`field-${field.key}`}
              className="text-[13px] font-medium tracking-[0.01em] text-[var(--ink-secondary)]"
            >
              {field.label}
            </Label>
            <Input
              id={`field-${field.key}`}
              type={field.type}
              placeholder={field.placeholder}
              value={data[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="bg-[var(--surface-2)]"
            />
          </div>
        );
      })}
    </div>
  );
}
