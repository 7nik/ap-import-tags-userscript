import { get, sleep } from "./ajax";
import LocalValue from "../localStorage";
    
type Params<ID> = Record<string, string|number> & { db: ID };
type textNumber = string; // number presented as string
type timestamp = string;

type BaseResult = {
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
type HMagazinesResult = BaseResult & {
    header: { index_id: 0 },
    data: {
        title: string,
        part: string,
        data: string,
    }
}
type HGameCGResult = BaseResult & {
    header: { index_id: 2 },
    data: {
        title: string,
        company: string,
        getch_id: textNumber,
    }
}
type PixivResult = BaseResult & {
    header: { index_id: 5|6|51|52|53 },
    data: {
        title: string,
        pixiv_id: number,
        member_name: string,
        member_id: number,
    }
}
type NicoNicoSeigaResult = BaseResult & {
    header: { index_id: 8 },
    data: {
        title: string,
        seiga_id: number,
        member_name: string,
        member_id: number,
    }
}
type DanbooruResult = BaseResult & {
    header: { index_id: 9 },
    data: {
        danbooru_id: number,
        creator: string,
        material: string,
        character: string,
        source: string,
    }
}
type DrawrImagesResult = BaseResult & {
    header: { index_id: 10 },
    data: {
        drawr_id: number,
        title: string,
        member_name: string,
        member_id: number,
    }
}
type NijieImagesResult = BaseResult & {
    header: { index_id: 11 },
    data: {
        nijie_id: number,
        title: string,
        member_name: string,
        member_id: number,
    }
}
type YandereResult = BaseResult & {
    header: { index_id: 12 },
    data: {
        yandere_id: number,
        creator: string,
        material: string,
        character: string,
        source: string,
    }
}
type FakkuResult = BaseResult & {
    header: { index_id: 16 },
    data: {
        creator: string,
        source: string,
    }
}
type HMiscResult = BaseResult & {
    header: { index_id: 18 },
    data: {
        creator: string[],
        source: string,
        eng_name: string,
        jp_name: string,
    }
}
type TwoDMarketResult = BaseResult & {
    header: { index_id: 19 },
    data: {
        creator: string[],
        source: string,
    }
}
type MediBandResult = BaseResult & {
    header: { index_id: 20 },
    data: {
        title: string,
        url: string,
        member_name: string,
        member_id: number,
    }
}
type AnidbResult = BaseResult & {
    header: { index_id: 21|211|22 },
    data: {
        source: string,
        anidb_aid: number,
        part: string,
        year: string,
        est_time: string,
    }
}
type ImdbResult = BaseResult & {
    header: { index_id: 23|24 },
    data: {
        source: string,
        imdb_id: number,
        part?: string,
        year: string,
        est_time: string,
    }
}
type GelbooruResult = BaseResult & {
    header: { index_id: 25 },
    data: {
        gelbooru_id: number,
        creator: string,
        material: string,
        characters: string,
        source: string,
    }
}
type KonachanResult = BaseResult & {
    header: { index_id: 26 },
    data: {
        konachan_id: number,
        creator: string,
        material: string,
        characters: string,
        source: string,
    }
}
type SankakuChanResult = BaseResult & {
    header: { index_id: 27 },
    data: {
        sankaku_id: number,
        creator: string,
        material: string,
        characters: string,
        source: string,
    }
}
type AnimePicturesResult = BaseResult & {
    header: { index_id: 28 },
    data: {
        "anime-pictures_id": number,
        creator: string,
        material: string,
        characters: string,
        source: string,
    }
}
type E621Result = BaseResult & {
    header: { index_id: 29 },
    data: {
        e621_id: number,
        creator: string,
        material: string,
        characters: string,
        source: string,
    }
}
type SankakuIdolResult = BaseResult & {
    header: { index_id: 30 },
    data: {
        idol_id: number,
        creator: string,
        material: string,
        characters: string,
        source: string,
    }
}
type BcyResult = BaseResult & {
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
type PortalGraphicsResult = BaseResult & {
    header: { index_id: 33 },
    data: {
        pg_id: number,
        title: string,
        member_name: string,
        member_id: number,
    }
}
type DeviantArtResult = BaseResult & {
    header: { index_id: 34|341 },
    data: {
        da_id: number,
        title: string,
        author_name: string,
        author_url: string,
    }
}
type PawooResult = BaseResult & {
    header: { index_id: 35 },
    data: {
        pawoo_id: number,
        pawoo_user_acct: string,
        pawoo_user_username: string,
        pawoo_user_display_name: string,
        created_at: timestamp,
    }
}
type MangaUpdatesResult = BaseResult & {
    header: { index_id: 36 },
    data: {
        mu_id: number,
        source: string,
        part: string,
        type: string,
    }
}
type MangaDexResult = BaseResult & {
    header: { index_id: 37 },
    data: {
        md_id: number,
        source: string,
        part: string,
        artist: string,
        author: string,
    }
}
type EHentaiResult = BaseResult & {
    header: { index_id: 38 },
    data: {
        source: string,
        creator: string[],
        eng_name: string,
        jp_name: string,
    }
}
type ArtStationResult = BaseResult & {
    header: { index_id: 39 },
    data: {
        title: string,
        as_project: string,
        author_name: string,
        author_url: string,
    }
}
type FurAffinityResult = BaseResult & {
    header: { index_id: 40 },
    data: {
        fa_id: number,
        title: string,
        author_name: string,
        author_url: string,
    }
}
type TwitterResult = BaseResult & {
    header: { index_id: 41 },
    data: {
        created_at: string,
        tweet_id: string,
        twitter_user_id: string,
        twitter_user_handle: string,
    }
}
type FurryNetworkResult = BaseResult & {
    header: { index_id: 42 },
    data: {
        fn_id: number,
        fn_type: string,
        title: string,
        author_name: string,
        author_url: string,
    }
}

type AnyResult = HMagazinesResult|HGameCGResult|PixivResult|NicoNicoSeigaResult|DanbooruResult|
DrawrImagesResult|NijieImagesResult|YandereResult|FakkuResult|HMiscResult|TwoDMarketResult|
MediBandResult|AnidbResult|ImdbResult|GelbooruResult|KonachanResult|SankakuChanResult|
AnimePicturesResult|E621Result|SankakuIdolResult|BcyResult|PortalGraphicsResult|
DeviantArtResult|PawooResult|MangaUpdatesResult|MangaDexResult|EHentaiResult|ArtStationResult|
FurAffinityResult|TwitterResult|FurryNetworkResult;

type AutoResult<id> = 
    id extends 0 ? HMagazinesResult :
    id extends 2 ? HGameCGResult :
    id extends 5|6|51|52|53 ? PixivResult :
    id extends 8 ? NicoNicoSeigaResult : 
    id extends 9 ? DanbooruResult :
    id extends 10 ? DrawrImagesResult :
    id extends 11 ? NijieImagesResult : 
    id extends 12 ? YandereResult :
    id extends 16 ? FakkuResult :
    id extends 18 ? HMiscResult :
    id extends 19 ? TwoDMarketResult :
    id extends 20 ? MediBandResult :
    id extends 21|211|22 ? AnidbResult :
    id extends 23|24 ? ImdbResult :
    id extends 25 ? GelbooruResult :
    id extends 26 ? KonachanResult :
    id extends 27 ? SankakuChanResult :
    id extends 28 ? AnimePicturesResult :
    id extends 29 ? E621Result :
    id extends 30 ? SankakuIdolResult :
    id extends 31|32 ? BcyResult :
    id extends 33 ? PortalGraphicsResult :
    id extends 34|341 ? DeviantArtResult :
    id extends 35 ? PawooResult :
    id extends 36 ? MangaUpdatesResult :
    id extends 37 ? MangaDexResult :
    id extends 38 ? EHentaiResult :
    id extends 39 ? ArtStationResult :
    id extends 40 ? FurAffinityResult :
    id extends 41 ? TwitterResult :
    id extends 42 ? FurryNetworkResult :
    id extends 999 ? AnyResult :
    never;

type ErrorResult = Exclude<
    {
        header: {
            user_id?: textNumber,
            account_type?: textNumber,
            short_limit?: textNumber,
            long_limit?: textNumber,
            long_remaining?: number,
            short_remaining?: number,
            results_requested?: number,
            // in case anon error or run out error only these two field presented
            status: number, // any non-zero value
            message: string, // error message
        }
    }, 
    {
        header: { status: 0 }
    }
>

type Response<dbID extends number> = {
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
    results: AutoResult<dbID>[],
}

let snapikey: string;
new LocalValue("snkey", "").subscribe((key) => {
    snapikey = key;
});
/**
 * Do search on SauceNAO
 * @param {Params} params - Params of the search (url, numres, db, dbmask, dbmaski, dedupe) 
 * @returns {Promise<Response} Found pictures
 */
async function saucenao<dbID extends number> (params: Params<dbID>): Promise<Response<dbID>> {
    let res: ErrorResult | Response<dbID>;
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
     * Find pictures on Anime-Pictures that are similar to the given one
     * @param {string} url - Picture to search 
     * @param {number} threshold - Minimal similarity of results 
     * @returns {Promise<AnimePicturesResult[]>} The found pictures
     */
    async searchOnAnimePictures (url: string, threshold: number = 50): Promise<AnimePicturesResult[]> {
        const res = await saucenao({ url, db: 28, numres: 10 });
        return res.results.filter((res) => +res.header.similarity >= threshold);
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
export type { AnimePicturesResult };
