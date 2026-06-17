export interface Project {
  slug: string;
  name: string;
  tagline: string;
  description: string[];
  tech: string[];
  liveUrl?: string;
  sourceUrl?: string;
  openSource: boolean;
  license?: string;
}

export const projects: Project[] = [
  {
    slug: 'linksonce',
    name: 'LinksOnce',
    tagline: 'A pay once Linktree alternative for creators. Own your data forever.',
    description: [
      'LinksOnce is a link in bio builder for creators. Instead of a monthly subscription, you pay $19 once and own your page forever, no recurring fees, ever.',
      'Build a link page for Instagram, TikTok, YouTube, and anywhere else you share, then export it and host it wherever you like. Your data stays yours.',
    ],
    tech: [
      'TypeScript',
      'React',
      'React Router',
      'Vite',
      'Hono',
      'Cloudflare Workers',
      'Neon Postgres',
      'Stripe',
      'Resend',
      'PostHog',
    ],
    liveUrl: 'https://linksonce.app/',
    openSource: false,
  },
  {
    slug: 'onyourfeet',
    name: 'On Your Feet',
    tagline: 'A no frills stand up reminder and desk break timer.',
    description: [
      'On Your Feet is a dead simple desk break timer for office workers. Start a 30, 45, or 60 minute work timer and it nudges you to get up and take a 5 minute walking break.',
      "It's backed by research on the health risks of sitting all day, and there's no login and no tracking. Just open it and go.",
    ],
    tech: [
      'TypeScript',
      'SvelteKit',
      'Svelte 5',
      'Tailwind CSS',
      'Paraglide i18n',
      'Playwright',
      'Cloudflare',
    ],
    liveUrl: 'https://onyourfeet.app',
    sourceUrl: 'https://github.com/jtwebman/onyourfeet',
    openSource: true,
    license: 'AGPL-3.0',
  },
  {
    slug: 'slowbreath',
    name: 'Slow Breath',
    tagline: 'A full screen pacer for slow, calming breathing.',
    description: [
      'Slow Breath is a full screen breathing pacer. It defaults to 4-4-4-4 box breathing and also offers 4-7-8 relax breathing. Just follow the animation.',
      "It's grounded in research on slow breathing's effect on blood pressure, anxiety, and focus, and it keeps things deliberately simple: no accounts, no tracking.",
    ],
    tech: [
      'TypeScript',
      'SvelteKit',
      'Svelte 5',
      'Tailwind CSS',
      'Paraglide i18n',
      'Playwright',
      'Cloudflare',
    ],
    liveUrl: 'https://slowbreath.app',
    sourceUrl: 'https://github.com/jtwebman/slowbreath',
    openSource: true,
    license: 'AGPL-3.0',
  },
  {
    slug: 'pterm',
    name: 'pterm',
    tagline: 'A project based terminal multiplexer for running CLI agents.',
    description: [
      'pterm is a cross platform desktop app that organizes your terminals around projects. Each project points to a folder and gets its own environment variables, configurable commands, and as many live terminal sessions as you need, all in one window.',
      'I built it for working with AI coding agents: run Claude, Codex, OpenCode, or any CLI tool in real terminal panes, and spin up git worktree branches so several agents can work in parallel without stepping on each other.',
    ],
    tech: ['TypeScript', 'Electron', 'React', 'xterm.js', 'node-pty', 'Tailwind CSS', 'SQLite'],
    sourceUrl: 'https://github.com/jtwebman/pterm',
    openSource: true,
    license: 'MIT',
  },
  {
    slug: 'bigquery-local',
    name: 'bigquery-local',
    tagline: 'A local emulator for the Google BigQuery REST API.',
    description: [
      "bigquery-local is a Node.js emulator for the Google BigQuery REST API, backed by DuckDB. It's a drop in for testing, CI, and local development, so you don't have to hit real BigQuery (or pay for it) just to run your tests.",
      'It supports the parts other emulators skip, including a working PATCH, and ships as a Docker image you can spin up in seconds.',
    ],
    tech: ['TypeScript', 'Node.js', 'DuckDB', 'Apache Arrow', 'gRPC / protobuf', 'Docker', 'Biome'],
    sourceUrl: 'https://github.com/jtwebman/bigquery-local',
    openSource: true,
    license: 'MIT',
  },
  {
    slug: 'csv-batch',
    name: 'csv-batch',
    tagline: 'A fast, zero dependency streaming CSV parser for Node.js.',
    description: [
      'csv-batch is a streaming CSV parser for Node.js with zero runtime dependencies. It parses huge files without holding them all in memory by emitting rows as it goes.',
      'On top of plain parsing it can batch rows for lower memory processing and run a reducer over rows for aggregations. Handy when you need to crunch a CSV without pulling in a heavy library.',
    ],
    tech: ['JavaScript', 'Node.js', 'Zero dependencies', 'Mocha', 'Chai'],
    sourceUrl: 'https://github.com/jtwebman/csv-batch',
    openSource: true,
    license: 'MIT',
  },
  {
    slug: 'puid',
    name: 'puid',
    tagline: 'A provably collision free counter in a trench coat. (A joke, fully built.)',
    description: [
      'puid, "Probably Unique IDentifier", is a joke taken way too far. It is the most overengineered way imaginable to count: a provably collision free sequential counter served from the cloud.',
      'Naturally it has a full REST API, an OpenAPI spec, SDKs in half a dozen languages, and a browser extension. Because why not.',
    ],
    tech: [
      'TypeScript',
      'SvelteKit',
      'Tailwind CSS',
      'Cloudflare Workers',
      'Cloudflare D1',
      'OpenAPI',
      'Playwright',
    ],
    liveUrl: 'https://puid.dev',
    sourceUrl: 'https://github.com/jtwebman/puid',
    openSource: true,
    license: 'AGPL-3.0',
  },
];
