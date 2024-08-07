/* eslint-disable no-await-in-loop */
import { GM } from "$";

export type Params = Record<string, string|number|boolean|null|undefined>;

type FetchFunc = (url: string, params: RequestInit) => Promise<Response>;

export const sleep = (time: number) => new Promise((resolve) => { setTimeout(resolve, time); });

// allowed HTTP header name according to rfc2616
// /^[\x21\x23-\x27\x2A\x2B\x2D\x2E\x30-\x39\x3D\x41-\x5A\x5E-\x7A\x7Cx7E]+:/
const HEADER_REGEXP = /^[\d!\u0023-\u0027*+.=A-Z\u005E-\u007A|-]+:/;

/**
 * A fetch-like function that works over GM.XHR
 * @param {string} url - Full URL of the request
 * @param {RequestInit} params - Other params of the function
 * @returns {Promise<Response>} Response object of the same type as fetch's
 */
export function gmFetch (url: string, params: RequestInit = {}): Promise<Response> {
    return new Promise<Response>((res, rej) => {
        GM.xmlHttpRequest({
            url,
            method: (params.method ?? "GET") as "GET" | "HEAD" | "POST",
            data: params.body as string,
            binary: !!params.body,
            nocache: true, // do not cache responses, especially bad ones
            responseType: "arraybuffer",
            onload (resp) {
                const headers: Record<string, string> = {};
                let prevHeader = "";
                for (const line of resp.responseHeaders.trim().split("\n")) {
                    if (HEADER_REGEXP.test(line)) {
                        const [name, value] = line.split(":");
                        headers[name] = value.trim();
                        prevHeader = name;
                    // otherwise it's multiline header
                    } else {
                        headers[prevHeader] += line;
                    }
                }
                res(new Response(resp.response, {
                    status: resp.status,
                    statusText: resp.statusText,
                    headers,
                }));
            },
            onabort () { rej(new Error("aborted")); },
            onerror (resp) {
                rej(new Error(resp.error ?? resp.statusText));
            },
        });
    });
}

/**
 * Does network query and re-attempts up to five times
 * @param {FetchFunc} fetch - The fetch function to use for querying
 * @param {string} url - Full URL of the request
 * @param {RequestInit} [params={}] - Get-params of the request
 * @returns {Promise<Response>} Raw server response
 */
export async function query (
    fetch: FetchFunc,
    url: string,
    params: RequestInit = {},
): Promise<Response> {
    params.credentials ??= new URL(url).host.endsWith(window.location.host) ? "include" : undefined;
    for (const nth of ["Second", "Third", "Fourth", "Fifth"]) {
        try {
            const resp = await fetch(url, params);
            // the 5xx response may be done by Cloudflare which sends HTML and
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
    return fetch(url, params);
}

async function json (resp: Response): Promise<any> {
    if (resp.headers.get("content-type")?.includes("/json")) {
        try {
            return resp.clone().json();
        } catch (ex) {
            console.error(ex, resp.statusText, await resp.text());
            throw (ex);
        }
    }
    console.warn(await resp.text());
    throw new Error("Not a json response");
}

/**
 * Make a GET query
 * @param {string} url - Full URL of the request
 * @param {Params} params - Query params to be added to the URL
 * @param {boolean} useGMXHR - use GM.XHR or fetch
 * @returns Promise<any> - JSON response
 */
export async function get (
    url: string,
    params: Params = {},
    useGMXHR: boolean = false,
): Promise<any> {
    const link = new URL(url, window.location.origin);
    for (const [key, value] of Object.entries(params)) {
        if (value == null) continue;
        link.searchParams.append(key, value.toString());
    }
    const func = useGMXHR ? gmFetch : fetch;
    return json(await query(func, link.toString(), { method: "GET" }));
}

/**
 * Send a POST query
 * @param {string} url - Full URL of the request
 * @param {Params} params - Query params to be send
 * @param {boolean} useGMXHR - use GM.XHR or fetch
 * @returns Promise<any> - JSON response
 */
export async function post (
    url: string,
    params: Params = {},
    useGMXHR: boolean = false,
): Promise<any> {
    const func = useGMXHR ? gmFetch : fetch;
    const body: RequestInit = { method: "POST" };
    if (params) {
        // const fdata = new FormData();
        // Object.entries(params).forEach(([key, value]) => {
        //     if (value === undefined) return;
        //     fdata.append(key, value.toString());
        // });
        // body.body = fdata;
        body.body = JSON.stringify(params);
        body.headers = { "Content-Type": "application/json" };
    }
    return json(await query(func, url, body));
}

/**
 * Send a DELETE query
 * @param {string} url - Full URL of the request
 * @param {Params} params - Query params to be send
 * @param {boolean} useGMXHR - use GM.XHR or fetch
 * @returns Promise<any> - JSON response
 */
export async function del (url: string, useGMXHR: boolean = false): Promise<any> {
    const func = useGMXHR ? gmFetch : fetch;
    return json(await query(func, url, { method: "DELETE" }));
}
