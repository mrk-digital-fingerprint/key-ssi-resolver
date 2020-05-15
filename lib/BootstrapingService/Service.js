'use strict';

const Protocol = require('./Protocol');
const RequestsChain = require('./RequestsChain');

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
                const { endpoint, protocol } = endpointConfig;
                this.addBrickStorageEndpoint(endpoint, protocol);
            }
        }

        if (Array.isArray(options.aliasEndpoints)) {
            for (const endpointConfig of options.aliasEndpoints) {
                const { endpoint, protocol } = endpointConfig;
                this.addAliasingEndpoint(endpoint, protocol);
            }
        }
    };

    const createProtocol = (container, endpoint, name) => {
        if (!Protocol.isValid(name)) {
            throw new Error(`Invalid protocol: ${name}`);
        }

        const protocol = Protocol.factory(name, {
            endpoint: endpoint
        })

        container.push({
            endpoint,
            protocol
        });
    }

    const getEndpointsSortedByFav = (container, favEndpoint) => {
        container = container.slice();
        container.sort((a, b) => {
            if (a.endpoint === favEndpoint) {
                return -1;
            }

            return 0;
        });

        return container;
    };

    const createRequestsChain = (method, endpointsContainer, favEndpoint, ...args) => {
        const requestsChain = new RequestsChain();

        if (favEndpoint) {
            endpointsContainer = getEndpointsSortedByFav(endpointsContainer, favEndpoint);
        }
        for (const endpointConfig of endpointsContainer) {
            const protocol = endpointConfig.protocol;
            requestsChain.add(protocol, method, args);
        }

        return requestsChain;
    };

    ////////////////////////////////////////////////////////////
    // Public methods
    ////////////////////////////////////////////////////////////
    this.addBrickStorageEndpoint = (endpoint, protocolName) => {
        createProtocol(brickEndpoints, endpoint, protocolName);
    }

    this.addAliasingEndpoint = (endpoint, protocolName) => {
        createProtocol(aliasEndpoints, endpoint, protocolName);
    }

    this.getBrick = (favEndpoint, dlDomain, hash, callback) => {
        const requestsChain = createRequestsChain('getBrick', brickEndpoints, favEndpoint, dlDomain, hash);
        requestsChain.execute(callback);
    }

    this.putBrick = (favEndpoint, dlDomain, brick, callback) => {
        const requestsChain = createRequestsChain('putBrick', brickEndpoints, favEndpoint, dlDomain, brick);
        requestsChain.execute(callback);
    }

    this.getAliasVersions = (favEndpoint, alias, callback) => {
        const requestsChain = createRequestsChain('getAliasVersions', aliasEndpoints, favEndpoint, alias);
        requestsChain.execute(callback);
    }

    this.updateAlias = (favEndpoint, alias, value, callback) => {
        const requestsChain = createRequestsChain('updateAlias', aliasEndpoints, favEndpoint, alias, value);
        requestsChain.execute(callback);
    }
    initialize();
}

module.exports = BootstrapingService;
