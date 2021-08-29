import { get, sleep } from "./ajax";
import LocalValue from "../localStorage";
    
type Params = Record<string, string|number>;
type SNParams<ID> = Params & { db: ID };
type textNumber = string; // number presented as string
type timestamp = string;

type SauceNaoResult = {
    header: {
        similarity: textNumber,
        thumbnail: string, // full link
        index_id: number,
        index_name: string,
        dupes: number,
    }
    data: {
        ext_urls: string[]
    }
}
type SnrHMagazines = SauceNaoResult & {
    header: { index_id: 0 },
    data: {
        title: string,
        part: string,
        data: string,
    }
}
type SnrHGameCG = SauceNaoResult & {
    header: { index_id: 2 },
    data: {
        title: string,
        company: string,
        getch_id: textNumber,
    }
}
type SnrPixiv = SauceNaoResult & {
    header: { index_id: 5|6|51|52|53 },
    data: {
        title: string,
        pixiv_id: number,
        member_name: string,
        member_id: number,
    }
}
type SnrNicoNicoSeiga = SauceNaoResult & {
    header: { index_id: 8 },
    data: {
        title: string,
        seiga_id: number,
        member_name: string,
        member_id: number,
    }
}
type SnrDanbooru = SauceNaoResult & {
    header: { index_id: 9 },
    data: {
        danbooru_id: number,
        creator: string,
        material: string,
        character: string,
        source: string,
    }
}
type SnrDrawrImages = SauceNaoResult & {
    header: { index_id: 10 },
    data: {
        drawr_id: number,
        title: string,
        member_name: string,
        member_id: number,
    }
}
type SnrNijieImages = SauceNaoResult & {
    header: { index_id: 11 },
    data: {
        nijie_id: number,
        title: string,
        member_name: string,
        member_id: number,
    }
}
type SnrYandere = SauceNaoResult & {
    header: { index_id: 12 },
    data: {
        yandere_id: number,
        creator: string,
        material: string,
        character: string,
        source: string,
    }
}
type SnrFakku = SauceNaoResult & {
    header: { index_id: 16 },
    data: {
        creator: string,
        source: string,
    }
}
type SnrHMisc = SauceNaoResult & {
    header: { index_id: 18 },
    data: {
        creator: string[],
        source: string,
        eng_name: string,
        jp_name: string,
    }
}
type Snr2DMarket = SauceNaoResult & {
    header: { index_id: 19 },
    data: {
        creator: string[],
        source: string,
    }
}
type SnrMediBand = SauceNaoResult & {
    header: { index_id: 20 },
    data: {
        title: string,
        url: string,
        member_name: string,
        member_id: number,
    }
}
type SnrAnidb = SauceNaoResult & {
    header: { index_id: 21|211|22 },
    data: {
        source: string,
        anidb_aid: number,
        part: string,
        year: string,
        est_time: string,
    }
}
type SnrImdb = SauceNaoResult & {
    header: { index_id: 23|24 },
    data: {
        source: string,
        imdb_id: number,
        part?: string,
        year: string,
        est_time: string,
    }
}
type SnrGelbooru = SauceNaoResult & {
    header: { index_id: 25 },
    data: {
        gelbooru_id: number,
        creator: string,
        material: string,
        characters: string,
        source: string,
    }
}
type SnrKonachan = SauceNaoResult & {
    header: { index_id: 26 },
    data: {
        konachan_id: number,
        creator: string,
        material: string,
        characters: string,
        source: string,
    }
}
type SnrSankakuChan = SauceNaoResult & {
    header: { index_id: 27 },
    data: {
        sankaku_id: number,
        creator: string,
        material: string,
        characters: string,
        source: string,
    }
}
type SnrAnimePictures = SauceNaoResult & {
    header: { index_id: 28 },
    data: {
        "anime-pictures_id": number,
        creator: string,
        material: string,
        characters: string,
        source: string,
    }
}
type SnrE621 = SauceNaoResult & {
    header: { index_id: 29 },
    data: {
        e621_id: number,
        creator: string,
        material: string,
        characters: string,
        source: string,
    }
}
type SnrSankakuIdol = SauceNaoResult & {
    header: { index_id: 30 },
    data: {
        idol_id: number,
        creator: string,
        material: string,
        characters: string,
        source: string,
    }
}
type SnrBcy = SauceNaoResult & {
    header: { index_id: 31|32 },
    data: {
        bcy_id: number,
        title: string,
        member_name: string,
        member_id: number,
        member_link_id: number,
        bcy_type: string,
    }
}
type SnrPortalGraphics = SauceNaoResult & {
    header: { index_id: 33 },
    data: {
        pg_id: number,
        title: string,
        member_name: string,
        member_id: number,
    }
}
type SnrDeviantArt = SauceNaoResult & {
    header: { index_id: 34|341 },
    data: {
        da_id: number,
        title: string,
        author_name: string,
        author_url: string,
    }
}
type SnrPawoo = SauceNaoResult & {
    header: { index_id: 35 },
    data: {
        pawoo_id: number,
        pawoo_user_acct: string,
        pawoo_user_username: string,
        pawoo_user_display_name: string,
        created_at: timestamp,
    }
}
type SnrMangaUpdates = SauceNaoResult & {
    header: { index_id: 36 },
    data: {
        mu_id: number,
        source: string,
        part: string,
        type: string,
    }
}
type SnrMangaDex = SauceNaoResult & {
    header: { index_id: 37 },
    data: {
        md_id: number,
        source: string,
        part: string,
        artist: string,
        author: string,
    }
}
type SnrEHentai = SauceNaoResult & {
    header: { index_id: 38 },
    data: {
        source: string,
        creator: string[],
        eng_name: string,
        jp_name: string,
    }
}
type SnrArtStation = SauceNaoResult & {
    header: { index_id: 39 },
    data: {
        title: string,
        as_project: string,
        author_name: string,
        author_url: string,
    }
}
type SnrFurAffinity = SauceNaoResult & {
    header: { index_id: 40 },
    data: {
        fa_id: number,
        title: string,
        author_name: string,
        author_url: string,
    }
}
type SnrTwitter = SauceNaoResult & {
    header: { index_id: 41 },
    data: {
        created_at: string,
        tweet_id: string,
        twitter_user_id: string,
        twitter_user_handle: string,
    }
}
type SnrFurryNetwork = SauceNaoResult & {
    header: { index_id: 42 },
    data: {
        fn_id: number,
        fn_type: string,
        title: string,
        author_name: string,
        author_url: string,
    }
}

type SnrAll = SnrHMagazines|SnrHGameCG|SnrPixiv|SnrNicoNicoSeiga|SnrDanbooru|
SnrDrawrImages|SnrNijieImages|SnrYandere|SnrFakku|SnrHMisc|Snr2DMarket|
SnrMediBand|SnrAnidb|SnrImdb|SnrGelbooru|SnrKonachan|SnrSankakuChan|
SnrAnimePictures|SnrE621|SnrSankakuIdol|SnrBcy|SnrPortalGraphics|
SnrDeviantArt|SnrPawoo|SnrMangaUpdates|SnrMangaDex|SnrEHentai|SnrArtStation|
SnrFurAffinity|SnrTwitter|SnrFurryNetwork;

type SnrRespType<id> = 
    id extends 0 ? SnrHMagazines :
    id extends 2 ? SnrHGameCG :
    id extends 5|6|51|52|53 ? SnrPixiv :
    id extends 8 ? SnrNicoNicoSeiga : 
    id extends 9 ? SnrDanbooru :
    id extends 10 ? SnrDrawrImages :
    id extends 11 ? SnrNijieImages : 
    id extends 12 ? SnrYandere :
    id extends 16 ? SnrFakku :
    id extends 18 ? SnrHMisc :
    id extends 19 ? Snr2DMarket :
    id extends 20 ? SnrMediBand :
    id extends 21|211|22 ? SnrAnidb :
    id extends 23|24 ? SnrImdb :
    id extends 25 ? SnrGelbooru :
    id extends 26 ? SnrKonachan :
    id extends 27 ? SnrSankakuChan :
    id extends 28 ? SnrAnimePictures :
    id extends 29 ? SnrE621 :
    id extends 30 ? SnrSankakuIdol :
    id extends 31|32 ? SnrBcy :
    id extends 33 ? SnrPortalGraphics :
    id extends 34|341 ? SnrDeviantArt :
    id extends 35 ? SnrPawoo :
    id extends 36 ? SnrMangaUpdates :
    id extends 37 ? SnrMangaDex :
    id extends 38 ? SnrEHentai :
    id extends 39 ? SnrArtStation :
    id extends 40 ? SnrFurAffinity :
    id extends 41 ? SnrTwitter :
    id extends 42 ? SnrFurryNetwork :
    id extends 999 ? SnrAll :
    never;

type SauceNaoError = {
    header: {
        user_id?: textNumber,
        account_type?: textNumber,
        short_limit?: textNumber,
        long_limit?: textNumber,
        long_remaining?: number,
        short_remaining?: number,
        results_requested?: number,
        // in case anon error or run out error only these two field presented
        status: -1, // in fact can be any non-zero value
        message: string, // error message
    }
}

type SauceNaoResults<dbID extends number> = {
    header: {
        user_id: textNumber,
        account_type: textNumber,
        short_limit: textNumber,
        long_limit: textNumber,
        long_remaining: number,
        short_remaining: number,
        status: 0,
        index: Record<string, {
            status: number,
            id: number,
            parent_id: number,
            results: number,
        }>,
        search_depth: textNumber,
        minimum_similarity: number,
        query_image_display: string, // relative link to the searched image
        query_image: string,
        results_requested: number,
        results_returned: number,
    }
    results: SnrRespType<dbID>[],
}

let snapikey: string;
new LocalValue("snkey", "").subscribe((key) => {
    snapikey = key;
});
/**
 * Do search on SauceNAO
 * @param {Params} params - Params of the search (url, numres, db, dbmask, dbmaski, dedupe) 
 * @returns {Promise<SauceNaoResults} Found pictures
 */
async function saucenao<dbID extends number> (params: SNParams<dbID>): Promise<SauceNaoResults<dbID>> {
    let res: SauceNaoError | SauceNaoResults<dbID>;
    for (let i = 0; i < 5; i++) {
        res = await get("https://saucenao.com/search.php", {
            output_type: 2,
            api_key: snapikey,
            ...params,
        }, true);

        if ("results" in res) {
            if (res.header.short_remaining < 10) {
                await sleep(res.header.short_remaining > 3 ? 1400 : 10000);
            }
            for (let index in res.header.index) {
                const { status } = res.header.index[index];
                if (status !== 0) {
                    console.warn(`Server #${index} is offline (status: ${status})`);
                }
            }
            if (res.results) {
                return res;
            }
            console.warn("No results:", params, res);
            await sleep(60000);
            continue;
        }

        const { message, status, short_remaining = 0, long_remaining = 0 } = res.header;
        console.warn("Replanishing:", { message, status, short_remaining, long_remaining });
        await sleep(31000);
    }
    throw new Error("Run out of search attempts");
}

const SauceNAO = {
    /**
     * Find the most similar picture to a given one on Anime-Pictures
     * @param {string} url - Picture to search 
     * @returns {Promise<SnrAnimePictures>} The best match
     */
    async findClosestOnAnimePictures (url: string): Promise<SnrAnimePictures> {
        const res = await saucenao({ url, db: 28, numres: 1 });
        return res.results[0];
    },
    /**
     * Get number of avaivable daily attempts to search (cost 1 attempt)
     * @returns {Promse<number>} Number of remaining daily attempts
     */
    async availableAttempts (): Promise<number> {
        return (await saucenao({ db: 999, url: "https://saucenao.com/images/static/banner_large.gif" }))
            .header.long_remaining;
    },
};

export default SauceNAO;
export type { SnrAnimePictures };
