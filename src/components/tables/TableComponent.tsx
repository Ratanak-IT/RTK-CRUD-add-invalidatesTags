"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@tanstack/react-table";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { DataTablePagination } from "../ui/data-pagination";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { DataTableFacetedFilter } from "../ui/command-range";
import {
  useCreateProductMutation,
  useGetBrandQuery,
  useGetCategoryQuery,
  useGetSupplierQuery,
} from "@/services/ecommerce";
import { toast } from "sonner";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ProductInput, ProductSchema } from "@/lib/zod/postProduct.shema";
import { FileUploadDemo } from "../uploadFile/FileUploadComponent";
import { useUploadFileMutation } from "@/services/uploadApi";
import { zodResolver } from "@hookform/resolvers/zod";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createNewProduct, { isLoading }] = useCreateProductMutation();
  const [uploadMutiFiles] = useUploadFileMutation();
  const { data: categoryData } = useGetCategoryQuery();
  const { data: supplierData } = useGetSupplierQuery();
  const { data: brandData } = useGetBrandQuery();

  const categories = categoryData?.content ?? [];
  const suppliers = supplierData?.content ?? [];
  const brands = brandData?.content ?? [];

  const methods = useForm<ProductInput>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: "",
      description: "",
      stockQuantity: 0,
      priceIn: 0,
      priceOut: 0,
      discount: 0,
      warranty: "1 year",
      thumbnail: [],
      availability: true,
      categoryUuid: "",
      supplierUuid: "",
      brandUuid: "",
      computerSpec: {
        processor: "",
        ram: "",
        storage: "",
        gpu: "",
        os: "",
        screenSize: "",
        battery: "",
      },
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

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
  });

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

  const onSubmit = async (formData) => {
    setIsSubmitting(true);

    try {
      let thumbnailUrl = "";
      if (Array.isArray(formData.thumbnail) && formData.thumbnail.length > 0) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", formData.thumbnail[0]);
        const uploadResult = await uploadMutiFiles(uploadFormData).unwrap();
        console.log("UPLOAD RESULT:", uploadResult);
        thumbnailUrl = uploadResult.location;
      }

      const payload = {
        ...formData,
        thumbnail: thumbnailUrl,
      };
      await createNewProduct(payload).unwrap();
      toast.success("Product created successfully");
      reset();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to Create product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div>
        <div className="flex items-center justify-between py-4">
          <div className="flex gap-4 items-center">
            <Input
              placeholder="Filter name..."
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            <DataTableFacetedFilter
              column={table.getColumn("name")}
              title="Name"
              options={getFacetedOptions("name")}
            />
            <DataTableFacetedFilter
              column={table.getColumn("priceOut")}
              title="Price"
              options={getFacetedOptions("priceOut")}
            />
          </div>

          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
                  Create Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>

                <FormProvider {...methods}>
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4 mt-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-xs font-semibold text-gray-700">
                          Product Name
                        </label>
                        <Input
                          {...register("name")}
                          placeholder="Milk"
                          className="mt-1"
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.name.message}
                          </p>
                        )}
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-semibold text-gray-700">
                          Description
                        </label>
                        <Input
                          {...register("description")}
                          placeholder="Product breakdown brief..."
                          className="mt-1"
                        />
                        {errors.description && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.description.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-700">
                          Cost ($)
                        </label>
                        <Input
                          type="number"
                          {...register("priceIn", { valueAsNumber: true })}
                          className="mt-1"
                        />
                        {errors.priceIn && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.priceIn.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-700">
                          Retail Price ($)
                        </label>
                        <Input
                          type="number"
                          {...register("priceOut", { valueAsNumber: true })}
                          className="mt-1"
                        />
                        {errors.priceOut && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.priceOut.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-700">
                          Stock Qty
                        </label>
                        <Input
                          type="number"
                          {...register("stockQuantity", {
                            valueAsNumber: true,
                          })}
                          className="mt-1"
                        />
                        {errors.stockQuantity && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.stockQuantity.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="border-t pt-3 mt-2">
                      <h4 className="text-sm font-bold text-gray-900 mb-2">
                        Hardware Specifications
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-600">
                            Processor
                          </label>
                          <Input
                            {...register("computerSpec.processor")}
                            placeholder="i7-13700H"
                            className="mt-1 h-9"
                          />
                          {errors.computerSpec?.processor && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.computerSpec.processor.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">
                            RAM Allocation
                          </label>
                          <Input
                            {...register("computerSpec.ram")}
                            placeholder="32GB DDR5"
                            className="mt-1 h-9"
                          />
                          {errors.computerSpec?.ram && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.computerSpec.ram.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">
                            Storage Size
                          </label>
                          <Input
                            {...register("computerSpec.storage")}
                            placeholder="1TB NVMe SSD"
                            className="mt-1 h-9"
                          />
                          {errors.computerSpec?.storage && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.computerSpec.storage.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">
                            Graphics Processing Unit (GPU)
                          </label>
                          <Input
                            {...register("computerSpec.gpu")}
                            placeholder="RTX 4050"
                            className="mt-1 h-9"
                          />
                          {errors.computerSpec?.gpu && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.computerSpec.gpu.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">
                            Screen Size / Panel
                          </label>
                          <Input
                            {...register("computerSpec.screenSize")}
                            placeholder="15.6-inch OLED"
                            className="mt-1 h-9"
                          />
                          {errors.computerSpec?.screenSize && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.computerSpec.screenSize.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">
                            Operating System
                          </label>
                          <Input
                            {...register("computerSpec.os")}
                            placeholder="Windows 11 Pro"
                            className="mt-1 h-9"
                          />
                          {errors.computerSpec?.os && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.computerSpec.os.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label>Battery</label>

                          <Input
                            {...register("computerSpec.battery")}
                            placeholder="90Wh"
                          />

                          {errors.computerSpec?.battery && (
                            <p className="text-red-500">
                              {errors.computerSpec.battery.message}
                            </p>
                          )}
                        </div>
                         <div>
                          <label>Discount</label>

                          <Input
                            {...register("discount",{
                              valueAsNumber: true
                            })}
                            placeholder="90Wh"
                          />

                          {errors.discount && (
                            <p className="text-red-500">
                              {errors.discount.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="text-xs text-gray-600">
                            Category
                          </label>
                          <select {...register("categoryUuid")}>
                            <option value="">Select Category</option>
                            {categories.map((item) => (
                              <option key={item.uuid} value={item.uuid}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                          {errors.categoryUuid && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.categoryUuid.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="text-xs text-gray-600">
                            Supplier
                          </label>
                          <select {...register("supplierUuid")}>
                            <option value="">Select Supplier</option>

                            {suppliers.map((item) => (
                              <option key={item.uuid} value={item.uuid}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                          {errors.supplierUuid && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.supplierUuid.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="text-xs text-gray-600">Brand</label>
                          <select {...register("brandUuid")}>
                            <option value="">Select Brand</option>

                            {brands.map((item) => (
                              <option key={item.uuid} value={item.uuid}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                          {errors.brandUuid && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.brandUuid.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="text-xs text-gray-600">
                            Thumnail
                          </label>
                          <FileUploadDemo />
                          {errors.thumbnail && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.thumbnail.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        {isLoading ? "Saving..." : "Save Product"}
                      </Button>
                    </div>
                  </form>
                </FormProvider>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
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
                            header.getContext(),
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
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-5">
          <DataTablePagination table={table} />
        </div>
      </div>
    </>
  );
}
