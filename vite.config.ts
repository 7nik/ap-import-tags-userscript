import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        svelte(),
        monkey({
            entry: "src/main.ts",
            userscript: {
                author: "7nik",
                namespace: "7nik",
                description: "Allow to match images from other sites against AP",
                match: ["https://anime-pictures.net/"],
                connect: [
                    "minitokyo.net",
                    "saucenao.com",
                    "static2.minitokyo.net",
                ],
            },
        }),
    ],
});
