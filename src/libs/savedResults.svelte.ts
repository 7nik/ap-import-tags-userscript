/* eslint-disable import/no-duplicates, unicorn/prefer-add-event-listener */
import type { SavedResult, SavedResultMeta } from "./matcher.svelte";
import storage from "./storage.svelte";

const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open("ap-import-tags-us", 1);
    if (!req) {
        reject(new Error("Failed to open DB"));
        return;
    }
    req.onupgradeneeded = () => {
        req.result.createObjectStore("results", { keyPath: "date" });
    };
    req.onsuccess = () => {
        if (req.result) {
            resolve(req.result);
        } else {
            reject(new Error("Failed to open DB"));
        }
    };
    req.onerror = reject;
});

function readDBValue(storeName: string, name: string | number): Promise<any> {
    return new Promise((resolve, reject) => {
        const request = db.transaction([storeName]).objectStore(storeName).get(name);
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = reject;
    });
}

function writeDBValue(storeName: string, value: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const request = db.transaction(storeName, "readwrite").objectStore(storeName).put(value);
        request.onsuccess = () => {
            resolve(true);
        };
        request.onerror = reject;
    });
}

function removeDBValue(storeName: string, name: string | number): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const request = db.transaction(storeName, "readwrite").objectStore(storeName).delete(name);
        request.onsuccess = () => {
            resolve(true);
        };
        request.onerror = reject;
    });
}

const savedResults = {
    get(timestamp: string | number): Promise<SavedResult | null> {
        return readDBValue("results", +timestamp);
    },
    async add(value: SavedResult) {
        const key = value.date.toString();
        await writeDBValue("results", value);
        const meta: SavedResultMeta = {
            date: value.date,
            providerName: value.providerName,
            query: value.query,
            size: value.results.length,
            type: value.results[0]?.source ? "matching" : "viewing",
        };
        storage.results = {
            ...storage.results,
            [key]: meta,
        };
    },
    async delete(value: Pick<SavedResult, "date">) {
        const key = value.date;
        await removeDBValue("results", key);
        const map = storage.results ?? {};
        delete map[key];
        storage.results = map;
    },
    list() {
        return Object.values(storage.results ?? {}).reverse();
    },
};

export default savedResults;
