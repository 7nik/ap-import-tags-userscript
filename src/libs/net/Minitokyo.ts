import { getHtml, getText } from "./ajax";

export type MinitokyoCategory = "wallpaper" | "art" | "scan";

export type TagCategory =
    | "Theme"
    | "Series"
    | "Character"
    | "Studio"
    | "Mangaka"
    | "Visual Novel"
    | "Circle"
    | "Meta"
    | "Game"
    | "Artbook"
    | "OVA"
    | "Source";

export type PostInfo = {
    id: number;
    width: number;
    height: number;
};

const Minitokyo = {
    tagPrefixes: [
        "wallpapers:",
        "wallpaper:",
        "w:",
        "arts:",
        "art:",
        "a:",
        "scans:",
        "scan:",
        "s:",
        "user:",
        "u:",
    ],
    parseQuery(query: string) {
        const prefixes: string[] = [];
        for (let i = 0; i < Minitokyo.tagPrefixes.length; i++) {
            const prefix = Minitokyo.tagPrefixes[i];
            if (query.startsWith(prefix)) {
                prefixes.push(prefix);
                query = query.slice(prefix.length);
                i = 0;
            }
        }
        const categoryPrefix = prefixes.find((prefix) => ["w", "a", "s"].includes(prefix[0]));
        const hasUserPrefix = prefixes.some((prefix) => prefix.startsWith("u"));
        return {
            query,
            category: categoryPrefix
                ? ({ w: "wallpaper", a: "art", s: "scan" }[categoryPrefix[0]] as MinitokyoCategory)
                : null,
            isUsername: hasUserPrefix,
        };
    },
    async autocompleteTag(tagName: string) {
        const text = await getText(
            "http://www.minitokyo.net/suggest",
            {
                q: tagName,
                limit: 10,
                timestamp: Date.now(),
            },
            true,
        );
        if (!text) return [];
        return text
            .trim()
            .split("\n")
            .map((s) => {
                const [tag, categories = ""] = s.split("|");
                return {
                    tag,
                    categories: categories.split(",") as TagCategory[],
                };
            });
    },
    async getCounts(query: string) {
        const parsed = Minitokyo.parseQuery(query);
        const name = parsed.query.replaceAll(" ", "+");
        const dom = parsed.isUsername
            ? await getHtml(`http://${name}.minitokyo.net/`, {}, true)
            : await getHtml(`http://www.minitokyo.net/${name}`, {}, true);
        const numbers =
            dom
                .getElementById("tabs")
                ?.textContent?.match(/\(\d+\)/g)
                ?.map((s) => +s.slice(1, -1)) ?? [];
        const a = dom.querySelector("#tabs > :last-child a") as HTMLAnchorElement;
        const id = new URL(a.href).searchParams.get("tid");
        return {
            tagId: id ? +id : null,
            wallpaper: numbers[0] ?? -1,
            art: numbers[1] ?? -1,
            scan: numbers[2] ?? -1,
        };
    },
    async findPosts(
        query: number | string,
        category: MinitokyoCategory,
        page: number,
    ): Promise<PostInfo[]> {
        const index = ["", "wallpaper", "art", "scan"].indexOf(category);
        const tid = typeof query === "number" ? query : null;
        const domain = typeof query === "string" ? query : "browse";
        const dom = await getHtml(
            `http://${domain}.minitokyo.net/gallery`,
            { tid, index, page },
            true,
        );

        return Array.from(
            dom.querySelectorAll(".wallpapers li:not(:empty), .scans li:not(:empty)"),
        ).map((elem) => {
            const id = Number(elem.querySelector("a")?.href.match(/\d+/));
            const [, width, height] = (
                elem.querySelector("p")?.textContent ?? elem.querySelector("img")?.title
            )
                ?.match(/(\d+)x(\d+)/)
                ?.map(Number) ?? [0, 0, 0];
            return { id, width, height };
        });
    },
};

export default Minitokyo;
