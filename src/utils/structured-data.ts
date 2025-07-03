import { siteConfig } from '../config/site';

export interface BlogPostStructuredData {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  image?: string;
  url: string;
}

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
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/blog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateBlogPostStructuredData(post: BlogPostStructuredData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.image || siteConfig.defaults.image,
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    author: {
      '@type': 'Person',
      name: post.author,
      url: siteConfig.author.website,
      image: siteConfig.author.avatar,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        '@type': 'ImageObject',
        url: siteConfig.author.avatar,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.url,
    },
    url: post.url,
  };
}

export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateServiceStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Software Engineering Consultation',
    description:
      'Professional software engineering consultation and advice from a 25+ year veteran',
    provider: {
      '@type': 'Person',
      name: siteConfig.author.name,
      url: siteConfig.author.website,
      image: siteConfig.author.avatar,
    },
    offers: {
      '@type': 'Offer',
      price: '100',
      priceCurrency: 'USD',
      description: 'One-hour consultation with a 25+ year software engineer',
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString(),
    },
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
    serviceType: 'Software Engineering Consultation',
    category: 'Professional Services',
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
