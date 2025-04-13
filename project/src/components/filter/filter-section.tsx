interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
}

export function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <div className="border-b py-8 dark:border-gray-800">
      <h3 className="mb-4 text-lg font-semibold dark:text-white">{title}</h3>
      {children}
    </div>
  );
}