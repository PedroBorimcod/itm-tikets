
import * as React from "react";
import { Row } from "@tanstack/react-table";
import { MoreVertical, Edit, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  onEdit: () => void;
  onDelete: () => void;
}

export function DataTableRowActions<TData>({
  row,
  onEdit,
  onDelete,
}: DataTableRowActionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="hover:bg-muted w-8 h-8 rounded-full"
        >
          <MoreVertical className="w-4 h-4" />
          <span className="sr-only">Ações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4}>
        <DropdownMenuItem onClick={onEdit} className="flex items-center gap-2">
          <Edit className="w-4 h-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDelete}
          className="flex items-center gap-2 text-destructive"
        >
          <Trash2 className="w-4 h-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
