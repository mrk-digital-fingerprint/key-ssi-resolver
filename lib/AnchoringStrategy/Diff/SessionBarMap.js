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
    const barMapDiffsStack = [];

    this.STATE_NEW = 'new';
    this.STATE_ANCHORING_IN_PROGRESS = 'in-progress';
    this.STATE_ANCHORED = 'anchored';

    // let diffBarMap = options.diffBarMap;

    /**
     * Create BarMap proxy methods
     */
    const initialize = () => {
        const barMapProperties = Object.getOwnPropertyNames(currentBarMap);

        if (options.diffBarMap) {
            this.registerDiff(options.diffBarMap);
        }

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
     * @return {BarMapDiff}
     */
    const getCurrentDiffBarMap = () => {
        const item = barMapDiffsStack[barMapDiffsStack.length - 1];
        return item.barMap;
    }

    /**
     * @param {BarMapDiff} barMapDiff
     */
    this.registerDiff = (barMapDiff) => {
        barMapDiffsStack.push({
            state: this.STATE_NEW,
            barMap: barMapDiff
        });
    }

    /**
     * @param {string} path
     * @param {Array<object>} bricks
     * @throws {Error}
     */
    this.addFileEntryProxyHandler = (path, bricks) => {
        currentBarMap.addFileEntry(path, bricks);
        getCurrentDiffBarMap().addFileEntry(path, bricks);
    }

    /**
     * @param {string} path
     * @param {Array<object>} bricks
     * @throws {Error}
     */
    this.appendBricksToFileProxyHandler = (path, bricks) => {
        currentBarMap.appendBricksToFile(path, bricks);
        getCurrentDiffBarMap().appendBricksToFile(path, bricks);
    }

    /**
     * @param {string} path
     * @throws {Error}
     */
    this.deleteProxyHandler = (path) => {
        currentBarMap.delete(path);
        getCurrentDiffBarMap().delete(path);
    }

    /**
     * @param {string} srcPath
     * @param {string} dstPath
     * @throws {Error}
     */
    this.copyProxyHandler = (srcPath, dstPath) => {
        currentBarMap.copy(srcPath, dstPath);
        getCurrentDiffBarMap().copy(srcPath, dstPath);
    }

    /**
     * @return {BarMap}
     */
    this.getCurrentDiff = () => {
        return getCurrentDiffBarMap();
    }

    this.changeDiffState = (diffBarMap, newState) => {
        const stackItem = barMapDiffsStack.find(element => element.barMap === diffBarMap);
        if (!stackItem) {
            throw new Error('Invalid diff received');
        }
        stackItem.state = newState;
    }

    this.linkNewestDiff = (barMapDiff, barMapDiffHash) => {
        for (let i = 0; i < barMapDiffsStack.length; i++) {
            const item = barMapDiffsStack[i];
            if (item.barMap !== barMapDiff) {
                continue;
            }

            const nextDiff = barMapDiffsStack[i + 1];
            if (nextDiff) {
                nextDiff.barMap.setPrevDiffHash(barMapDiffHash);
            }
            break;
        }
        // console.log(barMapDiffsStack);
    }

    initialize();
}

module.exports = SessionBarMap;
