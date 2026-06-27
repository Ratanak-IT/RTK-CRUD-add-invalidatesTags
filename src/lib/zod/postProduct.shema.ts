import { z } from "zod";

export const ProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(5, "Description is required"),

  computerSpec: z.object({
    processor: z.string().min(1, "Processor is required"),
    ram: z.string().min(1, "RAM size is required"),
    storage: z.string().min(1, "Storage configuration is required"),
    gpu: z.string().min(1, "GPU specification is required"),
    os: z.string().min(1, "Operating system is required"),
    screenSize: z.string().min(1, "Screen size is required"),
    battery: z.string().min(1, "Battery capacity is required"),
  }),

  stockQuantity: z
    .number()
    .int()
    .positive("Stock quantity must be greater than 0"),
  priceIn: z.number().positive("Buying price must be greater than 0"),
  priceOut: z.number().positive("Selling price must be greater than 0"),
  discount: z.number().min(0).max(100, "Discount must be between 0 and 100"),

  thumbnail: z.union([z.string(), z.array(z.any())]).optional(),
  warranty: z.string().min(1, "Warranty term is required"),
  availability: z.boolean().default(true),
  categoryUuid: z.string().uuid("Invalid Category ID format"),
  supplierUuid: z.string().uuid("Invalid Supplier ID format"),
  brandUuid: z.string().uuid("Invalid Brand ID format"),
});

export type ProductInput = z.infer<typeof ProductSchema>;
