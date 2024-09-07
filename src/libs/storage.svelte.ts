import type { SavedResult } from "./matcher.svelte";
import { untrack } from "svelte";

const PREFIX = "AP_tag_importer_";

type LocalData = {
    // api thins
    dbkey: string;
    snapikey: string;
    // settings
    pageSize: number;
    postSize: "150" | "300" | "500";
    showSource: boolean;
    isModerator: boolean;
    [k: `ma_${string}`]: { addTags: string; removeTags: string };
    // search results
    [k: `res_${string}`]: SavedResult;
};

const cache: Partial<LocalData> = $state({});

const storageMethods = {
    get<N extends keyof LocalData>(name: N): LocalData[N] | null {
        if (!(name in cache) && PREFIX.concat(name) in window.localStorage) {
            untrack(() => {
                cache[name] = JSON.parse(window.localStorage[PREFIX.concat(name)]);
                // if (cache[name] && typeof cache[name] === "object") {
                //     let obj: any = $state(cache[name]);
                //     $effect(() => { storage.set(name, obj); })
                // }
            });
        }
        return cache[name] ?? null;
    },
    set<N extends keyof LocalData>(name: N, value: LocalData[N]) {
        cache[name] = value;
        window.localStorage[PREFIX.concat(name)] = JSON.stringify(value);
    },
    delete(name: keyof LocalData) {
        delete cache[name];
        window.localStorage.removeItem(PREFIX.concat(name));
    },
    keys() {
        return Reflect.ownKeys(window.localStorage)
            .filter((name) => typeof name === "string" && name.startsWith(PREFIX))
            .map((name) => (name as string).slice(PREFIX.length));
    },
};

const storage = new Proxy(storageMethods, {
    get(_, prop) {
        if (prop in storageMethods) return storageMethods[prop as keyof typeof storageMethods];
        return storageMethods.get(prop as keyof LocalData);
    },
    set(_, prop, value) {
        if (prop in storageMethods) return false;
        storageMethods.set(prop as keyof LocalData, value);
        return true;
    },
    deleteProperty(_, prop) {
        storageMethods.delete(prop as keyof LocalData);
        return true;
    },
    ownKeys() {
        return storageMethods.keys();
    },
}) as Partial<LocalData> & Readonly<typeof storageMethods>;

window.addEventListener("storage", ({ key, newValue }: StorageEvent) => {
    if (!key || !key.startsWith(PREFIX)) return;
    const name = key.slice(PREFIX.length) as keyof LocalData;
    if (!(name in cache)) return;
    if (newValue == null) {
        delete cache[name];
    } else {
        cache[name] = JSON.parse(newValue);
    }
});

export default storage;
