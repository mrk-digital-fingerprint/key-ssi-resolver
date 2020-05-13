'use strict';

function DIDUrl(url, options) {
    if (typeof url === 'object') {
        options = url;
        url = undefined;
    }

    if (typeof url === 'undefined' && typeof options === 'undefined') {
        throw new Error('An url or options object is required');
    }
    options = options || {};

    this.prefix = options.prefix || 'did';
    this.type = null;
    this.segments = [];
    this.hashFragment = null;
    this.validator = options.validator;

    ////////////////////////////////////////////////////////////
    // Private methods
    ////////////////////////////////////////////////////////////
    const validate = (validator) => {
        if (validator.prefix) {
            if (this.prefix !== validator.prefix) {
                throw new Error(`Invalid did. Expected: ${validator.prefix}`);
            }
        }

        if (validator.type) {
            if (this.type !== validator.type) {
                throw new Error(`Invalid type. Expected: ${validator.type} `);
            }
        }

        if (typeof validator.segments === 'function') {
            if (!validator.segments(this.segments)) {
                throw new Error('Invalid did segments');
            }
        }

    }

    const parseUrl = (url) => {
        let segments = url.split('#');
        if (segments.length > 1) {
            this.hashFragment = segments.slice(1).join('#');
        }

        segments = segments.shift().split(':');

        const prefix = segments.shift();
        if (prefix !== this.prefix) {
            throw new Error('Not a valid did');
        }

        const type = segments.shift();
        if (!type) {
            throw new Error('Invalid did type');
        }

        this.type = type;

        if (!segments.length) {
            throw new Error('Incomplete did');
        }

        this.segments = segments;
    }

    if (typeof url === 'string') {
        parseUrl(url);
        if (typeof options.validator === 'object') {
            validate(options.validator);
        }
    } else {
        this.type = options.type;
        this.segments = Array.isArray(options.segments) ? options.segments.slice() : [];
        this.hashFragment = options.hashFragment;
    }

    this.getSegments = () => {
        return this.segments.slice();
    }

    this.getHashFragment = () => {
        return this.hashFragment;
    }

    this.getType = () => {
        return this.type;
    }

    this.toString = () => {
        let url = `did:${this.type}:${this.segments.join(':')}`;

        if (this.hashFragment) {
            url += `#${this.hashFragment}`;
        }

        return url;
    };
}

module.exports = DIDUrl;
