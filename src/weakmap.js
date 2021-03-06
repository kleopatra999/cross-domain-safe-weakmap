/* @flow */

import { isWindow, isClosedWindow } from './util';
import { hasNativeWeakMap } from './native';

let defineProperty = Object.defineProperty;
let counter = Date.now() % 1e9;

export class CrossDomainSafeWeakMap<K : Object, V : mixed> {

    name : string
    weakmap : WeakMap<K, V>
    keys : Array<K>
    values : Array<V>

    constructor() {
        counter += 1;
        this.name = `__weakmap_${Math.random() * 1e9 >>> 0}__${counter}`; // eslint-disable-line

        if (hasNativeWeakMap()) {
            try {
                this.weakmap = new window.WeakMap();
            } catch (err) {
                // pass
            }
        }

        this.keys  = [];
        this.values = [];
    }

    _cleanupClosedWindows() {

        let weakmap = this.weakmap;
        let keys = this.keys;

        for (let i = 0; i < keys.length; i++) {
            let value = keys[i];

            if (isClosedWindow(value)) {

                if (weakmap) {
                    try {
                        weakmap.delete(value);
                    } catch (err) {
                        // pass
                    }
                }

                keys.splice(i, 1);
                this.values.splice(i, 1);

                i -= 1;
            }
        }
    }

    set(key : K, value : V) {

        if (!key) {
            throw new Error(`WeakMap expected key`);
        }

        let weakmap = this.weakmap;

        if (weakmap) {
            try {
                weakmap.set(key, value);
            } catch (err) {
                delete this.weakmap;
            }
        }

        if (isWindow(key)) {

            this._cleanupClosedWindows();

            let keys = this.keys;
            let values = this.values;
            let index = keys.indexOf(key);

            if (index === -1) {
                keys.push(key);
                values.push(value);
            } else {
                values[index] = value;
            }

        } else {

            let name = this.name;
            let entry = key[name];

            if (entry && entry[0] === key) {
                entry[1] = value;
            } else {
                defineProperty(key, name, {
                    value: [ key, value ],
                    writable: true
                });
            }
        }
    }

    get(key : K) : V | void {

        if (!key) {
            throw new Error(`WeakMap expected key`);
        }

        let weakmap = this.weakmap;

        if (weakmap) {
            try {
                if (weakmap.has(key)) {
                    return weakmap.get(key);
                }
            } catch (err) {
                delete this.weakmap;
            }
        }

        if (isWindow(key)) {

            let keys = this.keys;
            let index = keys.indexOf(key);

            if (index === -1) {
                return;
            }

            return this.values[index];

        } else {

            let entry = key[this.name];

            if (entry && entry[0] === key) {
                return entry[1];
            }
        }
    }

    delete(key : K) {

        if (!key) {
            throw new Error(`WeakMap expected key`);
        }

        let weakmap = this.weakmap;

        if (weakmap) {
            try {
                weakmap.delete(key);
            } catch (err) {
                delete this.weakmap;
            }
        }

        if (isWindow(key)) {

            this._cleanupClosedWindows();

            let keys = this.keys;
            let index = keys.indexOf(key);

            if (index !== -1) {
                keys.splice(index, 1);
                this.values.splice(index, 1);
            }

        } else {

            let entry = key[this.name];

            if (entry && entry[0] === key) {
                entry[0] = entry[1] = undefined;
            }
        }
    }

    has(key : K) {

        if (!key) {
            throw new Error(`WeakMap expected key`);
        }

        let weakmap = this.weakmap;

        if (weakmap) {
            try {
                return weakmap.has(key);
            } catch (err) {
                delete this.weakmap;
            }
        }

        if (isWindow(key)) {

            this._cleanupClosedWindows();

            return this.keys.indexOf(key) !== -1;

        } else {

            let entry = key[this.name];

            if (entry && entry[0] === key) {
                return true;
            }

            return false;
        }
    }
}
