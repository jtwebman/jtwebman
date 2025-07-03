# Claude Development Guidelines

This document outlines the best practices, patterns, and conventions established for the jtwebman.com Astro website. Follow these guidelines to maintain code quality and consistency.

## Project Overview

**Technology Stack:**

- Astro 5.x with TypeScript
- Tailwind CSS v4
- Static Site Generation (SSG)
- Netlify deployment with form handling

**Development Tools:**

- ESLint 9.x with TypeScript support
- Prettier with Astro plugin
- EditorConfig for consistent formatting
- @types/node for Node.js types
- Automated validation scripts

**Architecture Principles:**

- Component-based architecture
- Centralized configuration
- Type-safe development
- Performance-first approach
- SEO optimization

## File Structure & Organization

```
src/
├── components/          # Reusable UI components
│   ├── BlogPostCard.astro
│   ├── ContactForm.astro
│   ├── ErrorBoundary.astro
│   ├── Footer.astro
│   ├── Header.astro
│   ├── LinkCard.astro
│   └── LoadingSpinner.astro
├── config/             # Configuration files
│   └── site.ts         # Central site configuration
├── content/            # Content collections
│   └── blog/           # Blog posts (markdown)
├── layouts/            # Page layouts
│   ├── BaseLayout.astro
│   └── BlogLayout.astro
├── pages/              # Route-based pages
├── styles/             # Global styles
│   └── global.css
└── utils/              # Utility functions
    ├── blog.ts         # Blog-related utilities
    ├── reading-time.ts # Reading time calculation
    ├── structured-data.ts # SEO structured data
    └── theme.ts        # Theme management
```

## Code Standards & Best Practices

### TypeScript Usage

**Always use TypeScript interfaces for component props:**

```typescript
export interface Props {
  title: string;
  description?: string;
  image?: string;
}
```

**Type all utility functions:**

```typescript
export function calculateReadingTime(content: string): {
  text: string;
  minutes: number;
  words: number;
};
```

**Use proper DOM element typing:**

```typescript
const form = document.getElementById('contact-form') as HTMLFormElement | null;
const button = document.getElementById('submit-btn') as HTMLButtonElement | null;
```

### Component Patterns

**Import order (always follow this pattern):**

```astro
---
// 1. Astro imports
import BaseLayout from '../layouts/BaseLayout.astro';

// 2. Component imports
import Header from '../components/Header.astro';

// 3. Utility imports
import { siteConfig } from '../config/site';
import { generateStructuredData } from '../utils/structured-data';

// 4. External library imports
import { getCollection } from 'astro:content';
---
```

**Error handling pattern:**

```astro
---
let data = [];
let error = null;

try {
  data = await fetchData();
} catch (err) {
  console.error('Error loading data:', err);
  error = err;
}
---

{
  error ? (
    <ErrorBoundary title="Failed to load content" message="Please try again later" />
  ) : (
    {
      /* Success content */
    }
  )
}
```

### Configuration Management

**Use centralized configuration from `src/config/site.ts`:**

```typescript
// ✅ Good - Use configuration
import { siteConfig } from '../config/site';
const authorName = siteConfig.author.name;

// ❌ Bad - Hard-coded values
const authorName = 'JT Turner';
```

**Configuration structure:**

```typescript
export const siteConfig = {
  name: string,
  author: {
    name: string,
    email: string,
    avatar: string,
    // ...
  },
  social: {
    github: string,
    linkedin: string,
    // ...
  },
  // ...
} as const;
```

### Theme Management

**Use shared theme utilities:**

```astro
---
import { getThemeScript, getThemeToggleScript } from '../utils/theme';
---

<!-- In head -->
<script is:inline set:html={getThemeScript()} />

<!-- For toggle buttons -->
<script is:inline set:html={getThemeToggleScript()} />
```

**Never duplicate theme detection logic across components.**

### SEO & Structured Data

**Always include structured data for pages:**

```astro
---
import {
  generateWebsiteStructuredData,
  generatePersonStructuredData,
} from '../utils/structured-data';

const structuredData = generatePersonStructuredData(); // or appropriate type
---

<BaseLayout structuredData={structuredData} />
```

**Required meta tags pattern:**

```astro
<BaseLayout title="Page Title" description="Page description" image="/images/page-image.jpg" />
```

### Form Handling

**Form validation pattern:**

```astro
<form data-netlify="true" netlify-honeypot="bot-field" action={siteConfig.pages.contactSuccess}>
  <!-- Include honeypot -->
  <p class="hidden">
    <label>Don't fill this out: <input name="bot-field" /></label>
  </p>

  <!-- Form fields with validation -->
  <input type="text" required minlength="2" maxlength="50" autocomplete="name" />
  <div class="error-message hidden" data-field="fieldname"></div>
</form>
```

**Include client-side validation with TypeScript:**

```typescript
interface ValidationRule {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message: string;
}
```

### Blog & Content

**Reading time calculation:**

```astro
---
import { getBlogPostsWithReadingTime } from '../utils/blog';

const posts = await getBlogPostsWithReadingTime();
---

<BlogPostCard readingTime={post.readingTime} />
```

**Blog layout props:**

```typescript
export interface Props {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  heroImage?: string;
  category: string;
  tags?: string[];
  readingTime?: string;
}
```

## Build & Development Commands

```bash
# Development
npm run dev

# Type checking (must pass before commits)
npm run check
npm run typecheck  # alias for check
npm run lint       # alias for check

# Build (always test before deployment)
npm run build

# Full validation (type check + build)
npm run validate

# Pre-commit validation (comprehensive check)
npm run pre-commit

# Preview built site
npm run preview
```

### Script Descriptions

- **`npm run check`** - Runs Astro's TypeScript and component checking
- **`npm run validate`** - Runs type checking followed by build (ensures everything works)
- **`npm run pre-commit`** - Complete validation before committing code
- **`npm run dev`** - Start development server with hot reload
- **`npm run build`** - Build production site
- **`npm run preview`** - Preview the built site locally

### Recommended Development Workflow

```bash
# 1. Start development
npm run dev

# 2. Make changes and test locally
# (development server auto-reloads)

# 3. Before committing - validate everything
npm run pre-commit

# 4. If validation passes, commit your changes
git add .
git commit -m "Your commit message"

# 5. Optional: Preview production build
npm run preview
```

### Quick Validation Commands

```bash
# Quick type check only
npm run check

# Type check + ensure build works
npm run validate

# Full pre-commit validation
npm run pre-commit
```

## Error Handling Patterns

### Component Error Boundaries

```astro
---
let data = null;
let error = null;

try {
  data = await riskyOperation();
} catch (err) {
  error = err;
}
---

{
  error ? (
    <ErrorBoundary title="Custom error title" message="Custom error message" showRetry={true} />
  ) : data ? (
    {
      /* Success content */
    }
  ) : (
    <LoadingSpinner message="Loading..." />
  )
}
```

### Client-side Error Handling

```typescript
// Always include null checks
if (element) {
  element.addEventListener('click', handler);
}

// Use try-catch for async operations
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Network error');
} catch (error) {
  console.error('Error:', error);
  // Show user-friendly error message
}
```

## Performance Best Practices

### Images

- Use `/images/` directory for static assets
- Include `alt` attributes for accessibility
- Use appropriate image formats (WebP when possible)

### CSS & Styling

- Use Tailwind CSS classes consistently
- Follow dark mode patterns: `class="text-gray-900 dark:text-gray-100"`
- Use CSS custom properties for theme colors

### JavaScript

- Minimize client-side JavaScript
- Use `is:inline` for critical scripts
- Prefer server-side rendering when possible

## Testing & Quality Assurance

### Before Every Commit

1. **Run `npm run pre-commit`** - This validates everything at once
   - Alternative: Run `npm run validate` for type checking + build
   - Or run individually: `npm run check` then `npm run build`
2. Test forms and interactive elements manually
3. Verify dark/light mode switching works
4. Check mobile responsiveness
5. Ensure all errors are fixed (0 TypeScript errors required)

### Code Review Checklist

- [ ] TypeScript interfaces defined for all props
- [ ] Error boundaries implemented where needed
- [ ] Configuration used instead of hard-coded values
- [ ] Structured data included for SEO
- [ ] Reading time calculated for blog posts
- [ ] Theme utilities used consistently
- [ ] Form validation implemented properly
- [ ] Accessibility attributes included

## Common Patterns & Snippets

### Page Layout Pattern

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { siteConfig } from '../config/site';

// Page-specific logic here
---

<BaseLayout title="Page Title" description="Page description">
  <div class="flex flex-col min-h-screen">
    <Header />

    <main class="flex-grow">
      <!-- Page content -->
    </main>

    <Footer />
  </div>
</BaseLayout>
```

### Blog Post Layout

```astro
---
import BlogLayout from '../layouts/BlogLayout.astro';
import { getReadingTimeFromMarkdown } from '../utils/reading-time';

const { Content, frontmatter } = Astro.props;
const readingTime = getReadingTimeFromMarkdown(Astro.props.rawContent()).text;
---

<BlogLayout {...frontmatter} readingTime={readingTime}>
  <Content />
</BlogLayout>
```

## Deployment Checklist

### Pre-deployment

- [ ] **Run `npm run pre-commit`** - Must pass with 0 errors
- [ ] All forms tested manually
- [ ] SEO meta tags verified
- [ ] Structured data validated (check browser dev tools)
- [ ] Performance tested
- [ ] Mobile responsiveness checked
- [ ] Dark/light theme switching verified

### Post-deployment

- [ ] Contact form submissions work
- [ ] Theme switching works
- [ ] Reading times display correctly
- [ ] Social sharing works
- [ ] Sitemap generated correctly

## Troubleshooting

### Common Issues

**Build Failures:**

- Check TypeScript errors first
- Verify all imports are correct
- Ensure configuration files are properly typed

**Form Issues:**

- Verify Netlify form attributes
- Check honeypot implementation
- Test client-side validation

**Theme Issues:**

- Ensure theme script is in `<head>`
- Check for duplicate theme logic
- Verify CSS classes for dark mode

### Debug Commands

```bash
# Detailed build information
npm run build -- --verbose

# Type checking with details
npx astro check --verbose

# Development with network access
npm run dev -- --host
```

## Maintenance Schedule

### Weekly

- Check for Astro and dependency updates
- Review and respond to contact form submissions
- Monitor site performance

### Monthly

- Update blog content
- Review and update configuration
- Check for security updates

### Quarterly

- Full code review and refactoring
- Performance optimization review
- SEO and structured data audit

---

**Last Updated:** 2025-01-03
**Astro Version:** 5.11.0
**Node Version:** 18+ recommended
