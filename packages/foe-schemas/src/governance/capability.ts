import { z } from "zod";
import { CapabilityIdPattern } from "./common.js";

export const CapabilitySchema = z.object({
  id: CapabilityIdPattern,
  title: z.string(),
  tag: z.string().regex(/^@CAP-\d+$/),
  category: z.enum([
    "Security",
    "Observability",
    "Communication",
    "Business",
    "Technical",
  ]),
  status: z.enum(["planned", "stable", "deprecated"]),
  description: z.string().optional(),
  path: z.string(),
});

export type Capability = z.infer<typeof CapabilitySchema>;
