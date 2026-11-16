import { z } from "zod";

export const ColumnSpecSchema = z.object({
  name: z.string(),
  type: z.enum(["text", "integer", "boolean", "timestamp", "json", "real"]),
  primaryKey: z.boolean().default(false),
  nullable: z.boolean().default(false),
  unique: z.boolean().default(false),
  references: z.string().optional(),
  defaultValue: z.any().optional(),
});

export const TableSpecSchema = z.object({
  name: z.string(),
  description: z.string(),
  columns: z.array(ColumnSpecSchema),
});

export const DbSchemaSpecSchema = z.object({
  tables: z.array(TableSpecSchema),
});

export type ColumnSpec = z.infer<typeof ColumnSpecSchema>;
export type TableSpec = z.infer<typeof TableSpecSchema>;
export type DbSchemaSpec = z.infer<typeof DbSchemaSpecSchema>;

