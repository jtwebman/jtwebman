import { siteConfig } from '../config/site';

export function generatePersonStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.author.name,
    url: siteConfig.author.website,
    image: siteConfig.author.avatar,
    description: siteConfig.author.bio,
    jobTitle: 'Software Engineer',
    worksFor: {
      '@type': 'Organization',
      name: 'Independent',
    },
    sameAs: [siteConfig.social.github, siteConfig.social.linkedin, siteConfig.social.twitter],
    address: {
      '@type': 'PostalAddress',
      addressLocality: siteConfig.author.location.split(',')[0],
      addressRegion: siteConfig.author.location.split(',')[1]?.trim(),
      addressCountry: 'US',
    },
  };
}

export function generateWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    author: {
      '@type': 'Person',
      name: siteConfig.author.name,
      url: siteConfig.author.website,
    },
  };
}

export function generateProjectStructuredData(project: {
  name: string;
  tagline: string;
  url: string;
  liveUrl?: string;
  sourceUrl?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: project.name,
    description: project.tagline,
    applicationCategory: project.liveUrl ? 'WebApplication' : 'DeveloperApplication',
    operatingSystem: 'Web',
    url: project.liveUrl ?? project.url,
    author: {
      '@type': 'Person',
      name: siteConfig.author.name,
      url: siteConfig.author.website,
    },
    ...(project.sourceUrl ? { codeRepository: project.sourceUrl } : {}),
  };
}

export function generateContactStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact JT Turner',
    description:
      'Get in touch with JT Turner for questions, advice, or collaboration opportunities.',
    url: `${siteConfig.url}/contact`,
    mainEntity: {
      '@type': 'Person',
      name: siteConfig.author.name,
      email: siteConfig.author.email,
      url: siteConfig.author.website,
      image: siteConfig.author.avatar,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Professional',
        email: siteConfig.author.email,
        availableLanguage: 'English',
      },
    },
  };
}
