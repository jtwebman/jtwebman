# JTWebMan.com Redesign Plan

## Project Overview

Rebuild jtwebman.com as a modern static site using Astro, focusing on a link-based homepage similar to Pinkary profile, while maintaining the blog functionality and incorporating content from all three existing platforms.

**Current Site Details:**

- Built with Hexo 3.2.2 static site generator
- 8 blog posts spanning 2011-2016
- Custom "clean-jtwebman" theme
- Hosted at jtwebman.com
- Source available at: https://github.com/jtwebman/jtwebman

## Tech Stack

- **Framework**: Astro (latest version)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Hosting**: Netlify
- **Content**: Markdown for blog posts
- **Icons**: Lucide Icons or Heroicons

## Site Architecture

### 1. Homepage (Link Hub)

- **Design**: Modern, minimal link page inspired by Pinkary
- **Sections**:
  - Hero section with name, title, and brief bio
  - Primary links grid (most important links)
  - Secondary links section
  - Contact/Connect section

### 2. Blog Section

- **URL**: `/blog`
- **Features**:
  - Archive of all blog posts from old site
  - New blog post capability
  - RSS feed
  - Reading time estimates
  - Category/tag system
  - Search functionality (optional)

### 3. About Page

- **URL**: `/about`
- **Content**:
  - Extended bio
  - Professional background
  - Skills and expertise
  - Timeline/career highlights

### 4. Services/Products Page

- **URL**: `/services`
- **Content from Stan Store**:
  - One-on-one consultations
  - Personalized video responses
  - Links to tools (Windsurf)
  - Code resources

## Design System

### Colors

- **Primary**: Neutral grays (#131313, #B3B3B3)
- **Accent**: Blue (#5383ff) for CTAs and hover states
- **Background**: White/off-white with dark mode support
- **Text**: High contrast for accessibility

### Typography

- **Headings**: System UI or Inter
- **Body**: System default with good readability
- **Code**: Monospace font (JetBrains Mono or similar)

### Layout

- **Max Width**: 1280px for content
- **Mobile First**: Responsive design
- **Grid System**: CSS Grid for link layouts
- **Spacing**: Consistent using Tailwind's spacing scale

## Content Migration

### Blog Posts to Import

1. "Is Finishing Side Projects Hard for You Too?" (2016-10-30)
   - About finishing side projects and motivation
   - Categories: Side Projects, Goals
2. "Frustrated Computer Programmer Learning Digital Marketing Finds an Unfair Advantage" (2016-07-08)
   - Programmer's advantages in digital marketing
   - Categories: Digital Marketing, Computer Programmer, Careers
3. "Gary Vaynerchuk Self-Awareness" (2016-06-29)
   - Self-discovery as a creator
   - Categories: Gary Vaynerchuk, Self Discovery, Soft Skills
4. "Elixir & Elm — Getting the Basics Setup" (2016-06-06)
   - Tutorial for Elixir/Phoenix development
   - Categories: Elixir, Elm, Phoenix, Programming
5. "5 Ways Scrum Is Done Wrong" (2015-02-14)
   - Common Scrum implementation mistakes
   - Categories: Scrum, agile
6. "Learn Multiple Programming Languages" (2015-02-08)
   - Benefits of polyglot programming
   - Categories: Programming, languages, learning
7. "Are You Tired of the Boring Lorem Ipsum?" (2011-09-12)
   - Alternatives to Lorem Ipsum
   - Categories: design, lorem ipsum, web development
8. "Remove Twitter Auto Post on Facebook Pages" (2011-05-24)
   - Quick tip for social media management
   - Categories: Social Media, Facebook, Twitter

### Migration Notes

- Current site uses Hexo 3.2.2 with custom "clean-jtwebman" theme
- Preserve permalink structure: `/:category/:title/`
- Convert Hexo-specific tags (e.g., `{% youtube %}`) to Astro components
- Migrate images from `/source/images/`
- Maintain Google Analytics (UA-23159838-1)
- Replace Disqus with "Discuss on Twitter/LinkedIn" links (no comment system)

### Links to Include

#### Developer Links

- GitHub: https://github.com/jtwebman
- Roblox Profile: https://www.roblox.com/users/2416255318/profile
- Fire Storm Game: https://www.roblox.com/games/74366617218328/Fire-Storm

#### Social Links

- LinkedIn: https://linkedin.com/in/jtwebman
- Twitter/X: https://x.com/jtwebman
- YouTube: https://www.youtube.com/@JTWebMan
- Instagram: https://instagram.com/jtwebman

#### Tools & Resources

- Windsurf Community: https://windsurf.com/refer?referral_code=k9mix1xeuk0nvg6r
- T-Shirt Store: https://www.zazzle.com/jtwebman

#### Services

- 1-Hour Consultation ($100)
- Personalized Video Response ($19.95)

## Technical Implementation

### Project Structure

```
jtwebman/
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── LinkCard.astro
│   │   ├── BlogPostCard.astro
│   │   └── SEO.astro
│   ├── content/
│   │   ├── blog/
│   │   │   └── [blog-posts].md
│   │   └── config.ts
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── BlogLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── services.astro
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [...slug].astro
│   │   └── rss.xml.ts
│   └── styles/
│       └── global.css
├── public/
│   ├── favicon.ico
│   └── images/
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

### Key Features to Implement

1. **Content Collections** for blog posts
2. **Dynamic OG images** for social sharing
3. **RSS feed** for blog subscribers
4. **Sitemap** for SEO
5. **Dark mode** toggle
6. **Analytics** integration (privacy-focused)
7. **Social discussion links** (Twitter/LinkedIn instead of comments)
8. **Share buttons** for easy social sharing

## Development Phases

### Phase 1: Setup & Foundation (Week 1)

- Initialize Astro project
- Configure TypeScript and Tailwind
- Create base layouts and components
- Set up content collections

### Phase 2: Homepage & Core Pages (Week 1-2)

- Implement link-based homepage
- Create about page
- Build services/products page
- Add navigation and footer

### Phase 3: Blog Migration (Week 2)

- Import all blog posts
- Create blog listing page
- Implement individual blog post pages
- Add RSS feed

### Phase 4: Polish & Optimization (Week 3)

- Add animations and transitions
- Implement dark mode
- Optimize performance
- Add SEO meta tags
- Create 404 page

### Phase 5: Deployment (Week 3)

- Configure Netlify deployment
- Set up custom domain
- Add analytics
- Test all functionality
- Launch!

## Performance Goals

- **Lighthouse Score**: 95+ across all metrics
- **Page Load**: < 2 seconds
- **Time to Interactive**: < 3 seconds
- **Bundle Size**: Minimal JavaScript

## SEO Considerations

- Structured data for blog posts
- OpenGraph tags for social sharing
- Canonical URLs
- XML sitemap
- Robots.txt
- Meta descriptions for all pages

## Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader friendly
- High contrast mode
- Focus indicators

## Future Enhancements

- Blog search functionality
- Newsletter integration
- More interactive elements
- Portfolio/project showcase
- Reading progress indicator
- Related posts suggestions
- WebMentions integration for social interactions

## Estimated Timeline

- **Total Duration**: 3 weeks
- **Development**: 2.5 weeks
- **Testing & Deployment**: 0.5 week

This plan provides a comprehensive roadmap for rebuilding your site with a modern, professional look while maintaining simplicity appropriate for a backend engineer.
