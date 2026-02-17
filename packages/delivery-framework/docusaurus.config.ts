import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Katalyst Delivery Framework',
  tagline: 'Governance-driven delivery with DDD, BDD, and FOE practices',
  favicon: 'img/favicon.ico',

  url: 'https://katalyst.dev',
  baseUrl: '/',

  organizationName: 'esimplicity',
  projectName: 'katalyst-domain-mapper',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: '.',
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/esimplicity/katalyst-domain-mapper/tree/main/packages/delivery-framework/',
          include: ['ddd/**/*.md', 'ddd/**/*.mdx', 'bdd/**/*.md', 'bdd/**/*.mdx', 'plans/**/*.md', 'plans/**/*.mdx', 'roads/**/*.md', 'roads/**/*.mdx', 'changes/**/*.md', 'changes/**/*.mdx', 'agents/**/*.md', 'agents/**/*.mdx', 'adr/**/*.md', 'adr/**/*.mdx', 'nfr/**/*.md', 'nfr/**/*.mdx', 'personas/**/*.md', 'personas/**/*.mdx', 'capabilities/**/*.md', 'capabilities/**/*.mdx', 'user-stories/**/*.md', 'user-stories/**/*.mdx', 'taxonomy/**/*.md', 'taxonomy/**/*.mdx', 'index.md', 'index.mdx'],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    './plugins/bdd-data-plugin.js',
    './plugins/roadmap-data-plugin.js',
  ],

  themes: ['@docusaurus/theme-mermaid'],

  markdown: {
    mermaid: true,
  },

  themeConfig: {
    announcementBar: {
      id: 'navigation_update',
      content:
        '<strong>Navigation Updated!</strong> Documentation now organized by software delivery lifecycle. <a href="/docs/taxonomy/index">See what\'s new →</a>',
      backgroundColor: '#2e7d32', // Darker green for WCAG 2.1 AA contrast (4.51:1)
      textColor: '#ffffff',
      isCloseable: true,
    },
    navbar: {
      title: 'Katalyst',
      logo: {
        alt: 'Katalyst Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'dropdown',
          label: 'Strategy',
          position: 'left',
          items: [
            {
              type: 'docSidebar',
              sidebarId: 'strategySidebar',
              label: 'Roadmap & Taxonomy',
            },
          ],
        },
        {
          type: 'dropdown',
          label: 'Discovery',
          position: 'left',
          items: [
            {
              type: 'docSidebar',
              sidebarId: 'discoverySidebar',
              label: 'Personas & Stories',
            },
          ],
        },
        {
          type: 'dropdown',
          label: 'Planning',
          position: 'left',
          items: [
            {
              type: 'docSidebar',
              sidebarId: 'planningSidebar',
              label: 'Plans & Capabilities',
            },
          ],
        },
        {
          type: 'dropdown',
          label: 'Design',
          position: 'left',
          items: [
            {
              type: 'docSidebar',
              sidebarId: 'designSidebar',
              label: 'DDD & ADRs',
            },
          ],
        },
        {
          type: 'dropdown',
          label: 'Testing',
          position: 'left',
          items: [
            {
              type: 'docSidebar',
              sidebarId: 'testingSidebar',
              label: 'BDD & NFRs',
            },
          ],
        },
        {
          type: 'dropdown',
          label: 'Automation',
          position: 'left',
          items: [
            {
              type: 'docSidebar',
              sidebarId: 'automationSidebar',
              label: 'AI Agents',
            },
          ],
        },
        {
          type: 'dropdown',
          label: 'History',
          position: 'left',
          items: [
            {
              type: 'docSidebar',
              sidebarId: 'historySidebar',
              label: 'Change Log',
            },
          ],
        },
        {
          href: 'https://github.com/esimplicity/katalyst-domain-mapper',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Domain Overview',
              to: '/docs/ddd/index',
            },
            {
              label: 'Architecture Decisions',
              to: '/docs/adr/index',
            },
            {
              label: 'Roadmap',
              to: '/docs/roads/index',
            },
            {
              label: 'Non-Functional Requirements',
              to: '/docs/nfr/index',
            },
          ],
        },
        {
          title: 'Development',
          items: [
            {
              label: 'BDD Testing',
              to: '/docs/bdd/index',
            },
            {
              label: 'Implementation Plans',
              to: '/docs/plans/index',
            },
            {
              label: 'Change History',
              to: '/docs/changes/index',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/esimplicity/katalyst-domain-mapper',
            },
          ],
        },
      ],
      copyright: `Copyright \u00a9 ${new Date().getFullYear()} eSimplicity Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['typescript', 'javascript', 'json', 'bash', 'gherkin'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
