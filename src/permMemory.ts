import type { Writable, Subscriber, Updater } from 'svelte/store';

const prefix = "AP_tag_importer_";
const cache: { [k:string]: Writable<any> } = {};

/**
 * Reads a saved value from `localStorage` if presented, otherwise - default value
 * @param  {string} name - Name of the value
 * @param  {any} defValue - Default value of the value
 * @return {any} Saved or default value
 */
function loadValue<Type> (name: string, defValue: Type): Type {
    const fullName = prefix.concat(name);
    if (fullName in localStorage) {
        return JSON.parse(localStorage[fullName]) as Type;
    }
    return defValue;
}

/**
 * Saves a value to `localStorage`
 * @param  {string} name - Name of the value
 * @param  {any} value - Value to save
 */
function saveValue (name: string, value: any): void {
    localStorage[prefix.concat(name)] = JSON.stringify(value);
}

/**
 * Removes the named value from `localStorage`
 * @param {string} name - Name of the value
 */
function removeValue (name: string): void {
    delete localStorage[prefix.concat(name)];
}

/**
 * Lists names of all saved values
 * @return {string[]} names of values
 */
function listValues (): string[] {
    return Reflect.ownKeys(localStorage)
        .filter((name) => typeof name === "string" && name.startsWith(prefix))
        .map((name) => (name as string).slice(prefix.length));
}

/**
 * Returns store compatible object that automatically
 * saves and read value to the `localStorage`
 * @param {string} name - Name of the value
 * @param {any} defValue - Default value
 * @returns {Writable<any>} Store compatible object
 */
function value<Type> (name: string, defValue: Type): Writable<Type> {
    if (name in cache) return cache[name];

    const subs: Subscriber<Type>[] = [];

    cache[name] = {
        subscribe: (fn: Subscriber<Type>) => {
            subs.push(fn);
            fn(loadValue(name, defValue));
            return () => {
                subs.splice(subs.indexOf(fn), 1);
            };
        },
        set: (value: Type) => {
            saveValue(name, value);
            subs.forEach((fn) => {
                try {
                    fn(value);
                } catch (ex) {
                    console.error(ex);
                }
            })
        },
        update: (fn: Updater<Type>) => {
            return cache[name].set(fn(loadValue(name, defValue)))
        },
    }
    return cache[name];
}

export { listValues, removeValue, value };

