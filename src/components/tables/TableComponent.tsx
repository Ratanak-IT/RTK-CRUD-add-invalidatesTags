"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "../ui/input"
import { DataTablePagination } from "../ui/data-pagination"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { DataTableFacetedFilter } from "../ui/command-range"
import { useCreateProductMutation } from "@/services/ecommerce"
import { toast } from "sonner"


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}



export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const [createNewProduct, {isLoading, err}] = useCreateProductMutation();

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })


  // Helper to get ALL unique values (not affected by current filters)
  const getFacetedOptions = (columnId: string) => {
    const column = table.getColumn(columnId);
    if (!column) return [];

    // Get all rows from the original data
    const allRows = table.getPreFilteredRowModel().rows;

    const uniqueValues = new Set<string>();

    allRows.forEach((row) => {
      const value = row.getValue(columnId);
      if (value != null) {
        uniqueValues.add(String(value));
      }
    });

    return Array.from(uniqueValues)
      .sort()
      .map((value) => ({
        label: value,
        value: value,
      }));
  };

  const newProduct = {
    name: "B sl o❤️❤️❤️",
    description:
      "Premium ultrabook with a stunning display for professionals.",

    computerSpec: {
      processor: "Intel Core i7-13700H",
      ram: "32GB DDR5",
      storage: "1TB NVMe SSD",
      gpu: "NVIDIA RTX 4050",
      os: "Windows 11 Pro",
      screenSize: "15.6-inch OLED",
      battery: "86Wh",
    },

    stockQuantity: 24,
    priceIn: 1450,
    priceOut: 1899,
    discount: 5,

    color: [
      {
        color: "Platinum Silver",
        images: ["https://example.com/silver-1.jpg"],
      },
    ],

    thumbnail: "https://example.com/thumb.jpg",
    warranty: "2 years",
    availability: true,

    images: ["https://example.com/img1.jpg"],

    categoryUuid: "462d9f60-8346-45ab-b8b3-a597d240965b",
    supplierUuid: "a34496d2-370e-4332-8c6d-b4a6bc069bf1",
    brandUuid: "8f2e3bcb-bb0b-45a1-b9bc-1d43f08f0ddb",
  };


  const handleCreateProduct = ()=> {
    try{
      createNewProduct(newProduct);
      toast.success("Product created successfully")
    }catch(error: any){
       toast.error(error?.data?.message || "Failed to Create product.");
    }
  }

  return (
    <>
      <div>
        <div className="flex items-center py-4">
          <div className="flex gap-4">
            <Input
              placeholder="Filter name..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            {/* command filter */}

            <DataTableFacetedFilter
              column={table.getColumn("name")}
              title="Name"
              options={getFacetedOptions("name")}
            />
            {/* price */}
            <DataTableFacetedFilter
              column={table.getColumn("priceOut")}
              title="Price"
              options={getFacetedOptions("priceOut")}
            />

          </div>

            <div>
          <DropdownMenu>

            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                View
              </Button>
            </DropdownMenuTrigger>
            <Button onClick={() => handleCreateProduct()} variant="outline" className="ml-auto">
                Create Product
              </Button>
            
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>

        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* data table pagination */}
        <div className="mt-5">
          <DataTablePagination table={table} />
        </div>
      </div>
    </>
  )
}