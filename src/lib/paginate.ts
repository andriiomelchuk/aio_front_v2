export const paginate = <T,>(
  items: T[],
  page: number,
  pageSize: number,
): T[] => {
  return items.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
};