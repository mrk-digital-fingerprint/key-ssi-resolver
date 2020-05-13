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

    this.saveDSU = (favEndpoint, DLDomain, callback) => {

    }

    this.loadDSU = (id, favEndpoint, DLDomain, callback) => {

    }

    this.getBrick = (id, favEndpoint, DLDomain, callback) => {

    }

    this.putBrick = (favEndpoint, DLDomain, brick, callback) => {

    }

    this.getAlias = (id, callback) => {

    }

    this.alias = (id, alias, callback) => {

    }

    initialize();
}

module.exports = BootstrapingService;
