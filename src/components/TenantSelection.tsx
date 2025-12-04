import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface TenantSelectionProps {
  onTenantChange: (tenant: string) => void;
  disabled?: boolean;
}

const TENANTS = [
  { value: "IMS_KENYA", label: "IMS Kenya" },
  { value: "IMS_UGANDA", label: "IMS Uganda" },
  { value: "IMS_TANZANIA", label: "IMS Tanzania" },
  { value: "IMS_ETHIOPIA", label: "IMS Ethiopia" },
];

export function TenantSelection({
  onTenantChange,
  disabled,
}: TenantSelectionProps) {
  const [selectedTenant, setSelectedTenant] = useState(TENANTS[0].value);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedTenant(value);
    onTenantChange(value);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-700">
        Select Tenant
      </label>
      <div className="relative">
        <select
          value={selectedTenant}
          onChange={handleChange}
          disabled={disabled}
          className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
        >
          {TENANTS.map((tenant) => (
            <option key={tenant.value} value={tenant.value}>
              {tenant.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
      </div>
    </div>
  );
}
