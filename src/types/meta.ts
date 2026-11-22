import { z } from 'zod';

export const MetaDataSchema = z.object({
  avatar: z.string().optional(),

  backgroundColor: z.string().optional(),
  description: z.string().optional(),

  marketIdentifier: z.string().optional(),

  name: z.string().optional(),

  tags: z.array(z.string()).optional(),

  title: z.string().optional()
});

export type MetaData = z.infer<typeof MetaDataSchema>;

export interface BaseDataModel {
  createdAt: number;

  id: string;
  meta: MetaData;

  updatedAt: number;
}
