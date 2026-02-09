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
          include: ['ddd/**/*.md', 'ddd/**/*.mdx', 'bdd/**/*.md', 'bdd/**/*.mdx', 'plans/**/*.md', 'plans/**/*.mdx', 'roads/**/*.md', 'roads/**/*.mdx', 'changes/**/*.md', 'changes/**/*.mdx', 'agents/**/*.md', 'agents/**/*.mdx', 'adr/**/*.md', 'adr/**/*.mdx', 'nfr/**/*.md', 'nfr/**/*.mdx', 'personas/**/*.md', 'personas/**/*.mdx', 'capabilities/**/*.md', 'capabilities/**/*.mdx', 'user-stories/**/*.md', 'user-stories/**/*.mdx', 'index.md', 'index.mdx'],
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
      id: 'alpha_notice',
      content:
        'This project is currently in <strong>Alpha</strong>. Features and documentation may change.',
      backgroundColor: '#ffd700',
      textColor: '#1a1a1a',
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
          type: 'docSidebar',
          sidebarId: 'dddSidebar',
          position: 'left',
          label: 'DDD',
        },
        {
          type: 'docSidebar',
          sidebarId: 'planningSidebar',
          position: 'left',
          label: 'Planning',
        },
        {
          type: 'docSidebar',
          sidebarId: 'bddSidebar',
          position: 'left',
          label: 'BDD',
        },
        {
          type: 'docSidebar',
          sidebarId: 'agentsSidebar',
          position: 'left',
          label: 'Agents',
        },
        {
          type: 'docSidebar',
          sidebarId: 'personasSidebar',
          position: 'left',
          label: 'Personas',
        },
        {
          type: 'docSidebar',
          sidebarId: 'capabilitiesSidebar',
          position: 'left',
          label: 'Capabilities',
        },
        {
          type: 'docSidebar',
          sidebarId: 'storiesSidebar',
          position: 'left',
          label: 'Stories',
        },
        {
          type: 'docSidebar',
          sidebarId: 'roadsSidebar',
          position: 'left',
          label: 'Roadmap',
        },
        {
          type: 'docSidebar',
          sidebarId: 'adrSidebar',
          position: 'left',
          label: 'ADRs',
        },
        {
          type: 'docSidebar',
          sidebarId: 'nfrSidebar',
          position: 'left',
          label: 'NFRs',
        },
        {
          type: 'docSidebar',
          sidebarId: 'changesSidebar',
          position: 'left',
          label: 'Changes',
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
