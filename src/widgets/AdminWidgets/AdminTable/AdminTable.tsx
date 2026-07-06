type AdminTableColumn<T> = {
  key: keyof T;
  label: string;
};

type AdminTableProps<T> = {
  columns: readonly AdminTableColumn<T>[];
  rows: readonly T[];
  getRowKey: (row: T) => string | number;
};

export const AdminTable = <T extends Record<string, React.ReactNode>>({
  columns,
  rows,
  getRowKey,
}: AdminTableProps<T>) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border text-muted">
            {columns.map((column) => (
              <th key={String(column.key)} className="px-3 py-2 font-medium">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr
              key={getRowKey(row)}
              className="border-b border-border last:border-0"
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className="px-3 py-3 text-foreground"
                >
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
