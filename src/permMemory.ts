const prefix = "AP_tag_importer_";

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
function saveValue (name: string, value: any) {
    const fullName = prefix.concat(name);
    localStorage[fullName] = JSON.stringify(value);
}

/**
 * Lists names of all saved values
 * @return {string[]} names of values
 */
function listValues (): string[] {
    return Reflect.ownKeys(localStorage)
        .filter((name) => typeof name === "string" && name.startsWith(prefix))
        .map((name: string) => name.slice(prefix.length));
}

function value<Type> (name: string, defValue: Type) {
    const subs = [];

    return {
        subscribe: (fn: (value: Type) => void) => {
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
        get: () => loadValue(name, defValue),
    }
}

export { loadValue, saveValue, listValues, value };

