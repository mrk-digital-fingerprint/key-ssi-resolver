'use strict';

/**
 * @param {string|object} url
 * @param {object|undefined} options
 * @param {string} options.dlDomain
 * @param {string} options.favouriteEndpoint
 */
function BaseDID(url, options) {
    if (typeof url === 'object') {
        options = url;
        url = undefined;
    }

    this.url = url;
    this.KEY_LENGTH = 32;
    this.options = options || {};
    this.dlDomain = this.options.dlDomain;
    this.favouriteEndpoint = this.options.favouriteEndpoint;

    ////////////////////////////////////////////////////////////
    // Public methods
    ////////////////////////////////////////////////////////////
    /**
     * @return {string}
     */
    this.getAnchorAlias = () => {
        throw new Error('Unimplemented');
    }

    /**
     * @return {string}
     */
    this.getDLDomain = () => {
        return this.dlDomain;
    }

    /**
     * @return {string}
     */
    this.getFavouriteEndpoint = () => {
        return this.favouriteEndpoint;
    }

    this.getKey = () => {
        throw new Error('Unimplemented');
    }

    /**
     * @return {string}
     */
    this.toUrl = () => {
        throw new Error('Unimplemented');
    }
}

module.exports = BaseDID;
