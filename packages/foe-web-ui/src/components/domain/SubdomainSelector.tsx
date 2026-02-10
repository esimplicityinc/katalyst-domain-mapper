interface SubdomainSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function SubdomainSelector({ value, onChange }: SubdomainSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
    >
      <option value="">Subdomain type (optional)</option>
      <option value="core">Core</option>
      <option value="supporting">Supporting</option>
      <option value="generic">Generic</option>
    </select>
  );
}
