'use strict';

/**
 * BarMap Proxy
 *
 * Its role is to write the destructive operations
 * to a diff bar map which will be later anchored.
 *
 * In order to provide read consistency, the same
 * destructive operations are applied to a clone
 * of a valid BarMap which will be discarded.
 *
 * Writes are done on both BarMap objects while
 * reading is done only from the cloned valid BarMap
 *
 * @param {object} options
 * @param {BarMap} options.currentBarMap
 * @param {BarMap} options.diffBarMap
 */
function SessionBarMap(options) {
    options = options || {};

    let currentBarMap = options.currentBarMap;
    let diffBarMap = options.diffBarMap;

    /**
     * Create BarMap proxy methods
     */
    const initialize = () => {
        const barMapProperties = Object.getOwnPropertyNames(currentBarMap);

        for (const propertyName of barMapProperties) {
            if (typeof currentBarMap[propertyName] !== 'function') {
                continue;
            }

            this[propertyName] = createProxyMethod(propertyName);
        }
    }


    /**
     * Create a proxy method for BarMap::{method}
     *
     * If a BarMapController has a method named ${method}ProxyHandler exists
     * the call to BarMap::{method} is redirected to
     * BarMapController::{method}ProxyHandler
     *
     * @param {string} method
     * @return {Proxy}
     */
    const createProxyMethod = (method) => {
        const proxy = new Proxy(function () {}, {
            apply: (target, thisArg, argumentsList) => {
                const targetHandlerName = `${method}ProxyHandler`;

                if (typeof this[targetHandlerName] === 'function') {
                    return this[targetHandlerName](...argumentsList);
                }
                return currentBarMap[method].apply(currentBarMap, argumentsList);
            }
        })

        return proxy;
    }

    /**
     * @param {string} path
     * @param {Array<object>} bricks
     * @throws {Error}
     */
    this.addFileEntryProxyHandler = (path, bricks) => {
        currentBarMap.addFileEntry(path, bricks);
        diffBarMap.addFileEntry(path, bricks);
    }

    /**
     * @param {string} path
     * @param {Array<object>} bricks
     * @throws {Error}
     */
    this.appendBricksToFileProxyHandler = (path, bricks) => {
        currentBarMap.appendBricksToFile(path, bricks);
        diffBarMap.appendBricksToFile(path, bricks);
    }

    /**
     * @param {string} path
     * @throws {Error}
     */
    this.deleteProxyHandler = (path) => {
        currentBarMap.delete(path);
        diffBarMap.delete(path);
    }

    /**
     * @param {string} srcPath
     * @param {string} dstPath
     * @throws {Error}
     */
    this.copyProxyHandler = (srcPath, dstPath) => {
        currentBarMap.copy(srcPath, dstPath);
        diffBarMap.copy(srcPath, dstPath);
    }

    /**
     * @return {BarMap}
     */
    this.getDiff = () => {
        return diffBarMap;
    }

    initialize();
}

module.exports = SessionBarMap;
