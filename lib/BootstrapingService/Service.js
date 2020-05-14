'use strict';

const Protocol = require('./Protocol');

function BootstrapingService(options) {
    options = options || {};

    const brickEndpoints = [];
    const aliasEndpoints = [];

    ////////////////////////////////////////////////////////////
    // Private methods
    ////////////////////////////////////////////////////////////
    const initialize = () => {
        if (Array.isArray(options.brickEndpoints)) {
            for (const endpointConfig of options.brickEndpoints) {
                const { endpoint, protocol, isFavourite } = endpointConfig;
                this.addBrickStorageEndpoint(endpoint, protocol, isFavourite);
            }
        }

        if (Array.isArray(options.aliasEndpoints)) {
            for (const endpointConfig of options.aliasEndpoints) {
                const { endpoint, protocol } = endpointConfig;
                this.addAliasingEndpoint(endpoint, protocol);
            }
        }
    };

    const createProtocol = (container, endpoint, name, isFavourite) => {
        if (!Protocol.isValid(name)) {
            throw new Error(`Invalid protocol: ${name}`);
        }

        isFavourite = !!isFavourite;

        const protocol = Protocol.factory(name, {
            endpoint: endpoint
        })

        container.push({
            endpoint,
            protocol,
            isFavourite
        });
    }

    ////////////////////////////////////////////////////////////
    // Public methods
    ////////////////////////////////////////////////////////////
    this.addBrickStorageEndpoint = (endpoint, protocolName, isFavourite) => {
        createProtocol(brickEndpoints, endpoint, protocolName, isFavourite);
    }

    this.addAliasingEndpoint = (endpoint, protocolName) => {
        createProtocol(aliasEndpoints, endpoint, protocolName);
    }

    // TODO: enable this after having a working demo
    // with the current Bar implementation
    //this.getBrick = (id, favEndpoint, DLDomain, callback) => {
    //}

    //this.putBrick = (favEndpoint, DLDomain, brick, callback) => {

    //}

    // Exclude the domain and favourite endpoint for now,
    // in order to get a working demo
    this.getBrick = (id, callback) => {
        throw new Error('get brick');
    }

    this.putBrick = (brick, callback) => {
        throw new Error('put brick');
    }

    this.getAliasVersions = (alias, callback) => {
        throw new Error('get alias versions');
    }

    this.updateAlias = (alias, value, callback) => {
        throw new Error('update alias');
    }
    initialize();
}

module.exports = BootstrapingService;
