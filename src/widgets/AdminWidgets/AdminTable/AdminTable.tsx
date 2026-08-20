import { T_AdminTableColumn, T_AdminTableProps } from "./types";

export const AdminTable = <T extends Record<string, React.ReactNode>>({
  columns,
  rows,
  getRowKey,
  emptyText = "No data found",
}: T_AdminTableProps<T>) => {
  const getAlignClass = (align: T_AdminTableColumn<T>["align"]) => {
    if (align === "center") {
      return "text-center";
    }

    if (align === "right") {
      return "text-right";
    }

    return "text-left";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-muted">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`px-3 py-2 font-medium ${getAlignClass(column.align)}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-8 text-center text-sm text-muted"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={getRowKey(row)}
                className="border-b border-border last:border-0"
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={`px-3 py-3 text-foreground ${getAlignClass(column.align)}`}
                  >
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};