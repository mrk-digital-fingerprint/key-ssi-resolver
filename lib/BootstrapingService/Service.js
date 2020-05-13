'use strict';

const Protocol = require('./Protocol');
const RequestsPipeline = require('./RequestsPipeline');

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

    const createPipeline = (endpoints, method) => {
        const pipeline = new RequestsPipeline();

        for (const endpointConfig of endpoints) {
            const protocol = endpointConfig.protocol;
            pipeline.addStep(protocol, method);
        }

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

    this.getBrick = (id, favEndpoint, DLDomain, callback) => {
        const pipelineGetBrick = createPipeline(brickEndpoints, 'getBrick');
        pipelineGetBrick.execute(id, callback);
    }

    this.putBrick = (favEndpoint, DLDomain, brick, callback) => {

    }

    this.getAlias = (id, callback) => {
        const pipelineGetAlias = createPipeline(aliasEndpoints, 'getAlias');
        pipelineGetAlias.execute(id, callback);
    }

    this.alias = (id, alias, callback) => {

    }

    this.getBarMap = (hash, callback) => {
        const pipelineGetBar = createPipeline(brickEndpoints, 'getBarMap');
        pipelineGetBar.execute(hash, callback);
    }

    this.putBarMap = (barMap, callback) => {

    }

    initialize();
}

module.exports = BootstrapingService;
