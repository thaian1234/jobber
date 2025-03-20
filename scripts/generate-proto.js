const { execSync } = require('child_process');
const path = require('path');

// Normalize path based on platform
const isWindow = process.platform === 'win32';
const pluginPath = path.normalize('./node_modules/.bin/protoc-gen-ts_proto');
const command = `protoc --plugin=protoc-gen-ts_proto${
    isWindow ? '.cmd' : ''
}=${pluginPath} --ts_proto_out=./types ./proto/*.proto --ts_proto_opt=nestJs=true`;

try {
    execSync(command, { stdio: 'inherit' });
} catch (error) {
    console.error('Error generating proto files:', error);
    process.exit(1);
}
