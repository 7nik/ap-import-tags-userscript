import type { Writable, Subscriber, Unsubscriber, Updater } from 'svelte/store';

/**
 * Represents store compatible object that automatically
 * saves and read value to the `localStorage`
 */
export default class LocalValue<Type> implements Writable<Type> {
    private subs: Subscriber<Type>[] = [];
    private name: string;
    private fullName: string;
    private defValue: Type;
    private static prefix = "AP_tag_importer_";
    private static cache: { [k:string]: LocalValue<any> } = {};
    /**
     * Create a store compatible object
     * @param {string} name - Name of the value
     * @param {Type} defValue - Default value
     */
    constructor (name: string, defValue: Type) {
        this.name = name;
        this.fullName = LocalValue.prefix.concat(this.name);
        this.defValue = defValue;
        if (name in LocalValue.cache) return LocalValue.cache[name];
        LocalValue.cache[name] = this;
    }
    /**
    * Reads a saved value from `localStorage` if presented, 
    * otherwise - returns default value
    * @return {Type} Saved or default value
    */
    private loadValue (): Type {
        if (this.fullName in localStorage) {
            return JSON.parse(localStorage[this.fullName]) as Type;
        }
        return this.defValue;
    }
    /**
     * Saves a value to `localStorage`
     * @param  {Type} value - Value to save
     */
    private saveValue (value: Type): void {
        localStorage[this.fullName] = JSON.stringify(value);
    }
    /**
     * Subscribe on value change
     * @param {Subscriber<Type>} fn - Subscriber  
     * @returns {Unsubscriber} Function to unsubscribe
     */
    subscribe (sub: Subscriber<Type>): Unsubscriber {
        this.subs.push(sub);
        sub(this.loadValue());
        return () => {
            const pos = this.subs.indexOf(sub);
            if (pos >= 0) this.subs.splice(pos, 1);
        };
    }
    /**
     * Set and save new value
     * @param {Type} value - Value to set 
     */
    set (value: Type) {
        this.saveValue(value);
        this.subs.forEach((sub) => {
            try {
                sub(value);
            } catch (ex) {
                console.error(ex);
            }
        });
    }
    /**
     * Update and save the value
     * @param {Updater<Type>} fn - Updater of the value 
     */
    update (fn: Updater<Type>): void {
        this.set(fn(this.loadValue()));
    }
    /**
     * Deletes the current value from `localStorage`
     */
    delete (): void {
        delete localStorage[this.fullName];
    }
    /**
     * Lists names of all saved values
     * @return {string[]} names of values
     */
    static listValues (): string[] {
        return Reflect.ownKeys(localStorage)
            .filter((name) => typeof name === "string" && name.startsWith(LocalValue.prefix))
            .map((name) => (name as string).slice(LocalValue.prefix.length));
    }
}
