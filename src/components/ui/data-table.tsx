
import * as React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "./table";

// DataTable props: expects columns[] and data[]
interface DataTableProps<T> {
  columns: {
    accessorKey?: keyof T;
    header: string;
    id?: string;
    cell?: (opt: { row: { original: T } }) => React.ReactNode;
  }[];
  data: T[];
}

export function DataTable<T>({ columns, data }: DataTableProps<T>) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.id || (col.accessorKey as string)}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">
                Sem dados
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIdx) => (
              <TableRow key={rowIdx}>
                {columns.map((col, colIdx) => (
                  <TableCell key={col.id || (col.accessorKey as string) || colIdx}>
                    {col.cell ? col.cell({ row: { original: row } }) : (col.accessorKey ? ((row as any)[col.accessorKey]) : null)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default DataTable;
