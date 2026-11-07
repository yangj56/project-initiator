import { z } from "zod";

export const healthQueryInput = z.object({
  echo: z.string().trim().max(80).optional(),
});
