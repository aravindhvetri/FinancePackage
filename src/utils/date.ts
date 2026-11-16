export function formatDate(dateString: string | number | Date): string {
  const obj = new Date(dateString);

  const day = obj.getDate();
  const month = obj.getMonth() + 1; // months are zero-based
  const year = obj.getFullYear();

  return `${day}/${month}/${year}`;
}