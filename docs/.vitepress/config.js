import { defineConfig } from "vitepress";
import AutoSidebar from "vite-plugin-vitepress-auto-sidebar";

export default defineConfig({
    title: "Savvy Guides", // Title of your site
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
                    return items.map(item => {
                        // Convert filename format to title case automatically
                        const text = item.text
                            .replace(/([A-Z])/g, ' $1') // Add space before capital letters
                            .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
                            .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between words
                            .trim();
                        
                        return {
                            ...item,
                            text
                        };
                    });
                },
                beforeCreateSideBarItems: (data) => data.sort(),
                titleFromFile: false
            })
        ],
    },
});
