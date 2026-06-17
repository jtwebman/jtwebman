export const siteConfig = {
  name: 'JTWebman',
  title: 'JTWebman - Principal Software Engineer & Entrepreneur',
  description:
    'Personal website of JT Turner, a principal software engineer and entrepreneur with over 25 years of experience building web applications and leading engineering teams.',
  url: 'https://jtwebman.com',
  ogImage: '/images/og-image.jpg',

  author: {
    name: 'JT Turner',
    email: 'jt@jtwebman.com',
    avatar: '/images/avatar.png',
    bio: 'Principal software engineer and entrepreneur with 25+ years of experience building web applications and leading engineering teams.',
    location: 'Beaverton, Oregon, USA',
    website: 'https://jtwebman.com',
  },

  social: {
    twitter: 'https://twitter.com/jtwebman',
    github: 'https://github.com/jtwebman',
    linkedin: 'https://linkedin.com/in/jtwebman',
    youtube: 'https://www.youtube.com/@JTWebMan',
    roblox: 'https://www.roblox.com/users/2416255318/profile',
  },

  navigation: [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Projects', href: '/projects' },
    { name: 'Contact', href: '/contact' },
  ],

  pages: {
    contactSuccess: '/contact-success',
  },

  defaults: {
    image: '/images/og-image.jpg',
    locale: 'en-US',
    dateFormat: 'en-US',
  },

  features: {
    rss: false,
    sitemap: true,
    analytics: false, // Add analytics ID when ready
  },
} as const;

export type SiteConfig = typeof siteConfig;
