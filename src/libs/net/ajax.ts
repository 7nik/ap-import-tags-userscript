type Params = Record<string, string|number>;

type FetchFunc = (url: string, params: RequestInit) => Promise<Response>;

const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

/**
 * A fetch-like function that works over GM.XHR
 * @param {string} url - Full URL of the request 
 * @param {RequestInit} params - Other params of the function 
 * @returns {Promise<Response>} Response object of the same type as fetch's
 */
async function gmFetch (url: string, params: RequestInit = {}): Promise<Response> {
    let resolveResp, rejectResp;
    const respPromise: Promise<GM.Response<any>> = new Promise((res, rej) => {
        resolveResp = res; 
        rejectResp = rej; 
    });
    const details = {
        url, 
        method: params.method ?? "GET", 
        data: params.body,
        binary: !!params.body,
        responseType: "arraybuffer",
        onload: resolveResp,
        onabort: rejectResp,
    };
    // @ts-ignore
    GM.xmlHttpRequest(details);
    try {
        const resp = await respPromise;
        return new Response(resp.response, {
            status: resp.status, statusText: resp.statusText
        });
    } catch (resp: any) {
        throw new Error(resp?.toString());
    }
}

/**
 * Does network query and re-attempts up to five times
 * @param {FetchFunc} fetch - The fetch function to use for querying
 * @param {string} url - Full URL of the request 
 * @param {RequestInit} [params={}] - Get-params of the request 
 * @returns {Promise<Response>} Raw server response
 */
async function query (fetch: FetchFunc, url: string, params: RequestInit = {}): Promise<Response> {
    for (const nth of ["Second", "Third", "Fourth", "Fifth"]) {
        try {
            const resp = await fetch(url, params);
            // the 5xx reponse may be done by Cloudflare which sents HTML and
            // attempt to parse it as JSON will throw error
            if (resp.status >= 500) {
                console.warn(url, `\nServer responded with ${resp.status} code. ${nth} attempt`);
                await sleep(5000);
                continue;
            } else {
                return resp;
            }
        } catch (ex) {
            console.warn(ex, url, `\nFetch error. ${nth} attempt`);
            await sleep(5000);
        }
    }
    // do not mute exception at the last attempt
    return await fetch(url, params);
}

/**
 * Make a GET query
 * @param {string} url - Full URL of the request 
 * @param {Params} params - Query params to be added to the URL
 * @param {boolean} useGMXHR - use GM.XHR or fetch
 * @returns Promise<any> - JSON response
 */
async function get (url: string, params: Params = {}, useGMXHR: boolean = false): Promise<any> {
    const link = new URL(url);
    Object.entries(params).forEach(
        ([key, value]) => link.searchParams.append(key, value.toString())
    );
    const func = useGMXHR ? gmFetch : fetch;
    const resp = await query (func, link.toString(), { method: "GET" });
    try {
        return await resp.clone().json();
    } catch (ex) {
        console.error(ex);
        console.info(await resp.text());
        throw (ex);
    }
}

/**
 * Send a POST query
 * @param {string} url - Full URL of the request 
 * @param {Params} params - Query params to be send
 * @param {boolean} useGMXHR - use GM.XHR or fetch
 * @returns Promise<any> - JSON response
 */
async function post (url: string, params: Params = {}, useGMXHR: boolean = false): Promise<any>{
    const func = useGMXHR ? gmFetch : fetch;
    const body: RequestInit = { method: "POST" };
    if (params) {
        const fdata = new FormData();
        Object.entries(params).forEach(([key, value]) => fdata.append(key, value.toString()));
        body.body = fdata;
    }
    const resp = await query (func, url, body);
    try {
        return await resp.clone().json();
    } catch (ex) {
        console.error(ex);
        console.info(await resp.text());
        throw (ex);
    }
}

export { get, post, sleep };
