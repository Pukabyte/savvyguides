import { defineConfig } from "vitepress";
import AutoSidebar from "vite-plugin-vitepress-auto-sidebar";

export default defineConfig({
    title: "Savvy Guides",
    description: "Guides For Creating The Ultimate Debrid Media Server", 
    base: "/",
    ignoreDeadLinks: true,

    themeConfig: {
        nav: [
            { text: "Home", link: "/" },
            { text: "Guides & Tutorials", link: "/intro" },
            { text: "Join The Discord", link: "https://discord.gg/vMSnNcd7m5" },
        ],
        sidebar: [],
        search: {
            provider: 'local'
        }
    },

    head: [["link", { rel: "stylesheet", href: "/styles.css" }]],

    vite: {
        plugins: [
            AutoSidebar({
                ignoreList: ["ignore-this-folder"],
                path: "/docs",
                ignoreIndexItem: false,
                collapsed: false,
                deletePrefix: "",
                sideBarResolved: (data) => data,
                sideBarItemsResolved: (items) => {
                    return items
                        .map(item => {
                            if (!item || !item.text) return item;
                            
                            const text = item.text
                                .replace(/([A-Z])/g, ' $1')
                                .replace(/^./, str => str.toUpperCase())
                                .replace(/([a-z])([A-Z])/g, '$1 $2')
                                .replace(/([a-z])([a-z]*)/g, (match, p1, p2) => {
                                    return p2.includes('guides') ? p1 + p2.replace('guides', ' Guides') : match;
                                })
                                .trim();
                            
                            return {
                                ...item,
                                text
                            };
                        })
                        .sort((a, b) => {
                            // Safely check if properties exist
                            const aPath = a?.link?.toLowerCase() || '';
                            const bPath = b?.link?.toLowerCase() || '';
                            
                            if (aPath.includes('overview')) return -1;
                            if (bPath.includes('overview')) return 1;
                            return 0;
                        });
                },
                titleFromFile: false
            })
        ],
    },
});