import { get, getText } from "./ajax";

type RawPostInfo = {
    deviationId: number;
    type: string;
    typeId: number;
    url: string; // full url
    shortUrl: string; // full fav.me url
    title: string;
    publishedTime: string; // ISO format
    media: {
        baseUri: string;
        prettyName: string;
        token?: [string];
        types: Array<{
            t: string; // size
            r: number;
            c: string;
            h: number;
            w: number;
            o: boolean;
            ss?: {
                x: number;
                c: string;
                h: number;
                w: number;
            };
        }>;
    };
};

export type PostInfo = {
    id: number;
    width: number;
    height: number;
    sizes: RawPostInfo["media"];
};

const PAGE_SIZE = 60; // max
let csrf = "";

async function updateCsrf() {
    const html = await getText(`https://www.deviantart.com/`, {}, true);
    [, csrf] = html.match(/window\.__CSRF_TOKEN__\s*=\s*'([^']+)'/) ?? ["", ""];
}

const DeviantArt = {
    async getCounts(username: string) {
        if (!csrf) await updateCsrf();

        const resp = await get(
            "https://www.deviantart.com/_puppy/dashared/user/info",
            {
                username,
                csrf_token: csrf,
            },
            true,
        );
        return resp.deviationsCount as number;
    },
    async findPosts(username: string, page: number) {
        if (!csrf) await updateCsrf();

        const resp: {
            hasMore: boolean;
            nextOffset: number;
            results: RawPostInfo[];
        } = await get(
            "https://www.deviantart.com/_puppy/dashared/gallection/contents",
            {
                username,
                type: "gallery",
                offset: page * PAGE_SIZE,
                limit: PAGE_SIZE,
                all_folder: "true",
                csrf_token: csrf,
            },
            true,
        );

        return {
            nextPage: resp.hasMore ? page + 1 : null,
            posts: resp.results.map((post) => {
                const full = post.media.types.find((t) => t.t === "fullview")!;
                if (!full) console.error("no full", post);
                return {
                    id: post.deviationId,
                    width: full?.w,
                    height: full?.h,
                    sizes: post.media,
                };
            }),
        };
    },
};

export default DeviantArt;
