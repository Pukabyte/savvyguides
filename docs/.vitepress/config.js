import { defineConfig } from 'vitepress';
import AutoSidebar from 'vite-plugin-vitepress-auto-sidebar';

export default defineConfig({
  title: 'Savvy Guides', // Title of your site
  description: 'Guides For Creating The Ultimate Debrid Media Server', // Description of your site
  base: '/', // Base URL for your site. Adjust if your site is deployed to a sub-path

  themeConfig: {
    // Configuration for the theme
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guides & Tutorials', link: '/intro' },
      { text: 'Join The Discord', link: 'https://discord.gg/wDgVdH8vNM' },
    ],
    // Ensure sidebar is cleared to allow auto-generation
    sidebar: [],
  },

  head: [
    ['link', { rel: 'stylesheet', href: '/styles.css' }]
  ],

  vite: {
    plugins: [
      // Add AutoSidebar plugin
      AutoSidebar({
        // You can also set options to adjust sidebar data
        // see option document below
        ignoreList: ['ignore-this-folder'],
        path: '/docs',
        ignoreIndexItem: false,
        collapsed: false,
        deletePrefix: '',
        sideBarResolved: (data) => data,
        sideBarItemsResolved: (data) => data,
        beforeCreateSideBarItems: (data) => data.sort(),
        titleFromFile: false,
      })
    ]
  }
});
