import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const longshot = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/long-shot' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    // 'research' = reading and reasoning, 'experiment' = we ran something,
    // 'note' = short update.
    kind: z.enum(['research', 'experiment', 'note']).default('research'),
    // Run id from the Kepler results database, when a post reports a real run.
    runId: z.number().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { longshot };
