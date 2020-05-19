'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs');

function setValidPort(port, endpointsConfiguration, brickEndpointIndex, aliasEndpointIndex) {
    if (typeof aliasEndpointIndex === 'undefined') {
        aliasEndpointIndex = brickEndpointIndex;
    }

    const brickEndpoints = endpointsConfiguration.brickEndpoints;

    let endpoint = brickEndpoints[brickEndpointIndex];
    endpoint.endpoint = endpoint.endpoint.replace('{port}', port);

    const aliasEndpoints = endpointsConfiguration.aliasEndpoints;

    endpoint = aliasEndpoints[aliasEndpointIndex];
    endpoint.endpoint = endpoint.endpoint.replace('{port}', port);
}

function createTestFolder(prefix, callback) {
    const testFolderPath = path.join(os.tmpdir(), prefix);
    fs.mkdtemp(testFolderPath, (err, res) => {
        callback(err, res);
    });
}

module.exports = {
    setValidPort,
    createTestFolder
}
