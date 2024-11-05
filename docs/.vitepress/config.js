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
            { text: "Join The Discord", link: "https://discord.gg/wDgVdH8vNM" },
        ],
        sidebar: [],
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
                sideBarItemsResolved: (data) => data,
                beforeCreateSideBarItems: (data) => data.sort(),
                titleFromFile: false,
            }),
        ],
    },
});
