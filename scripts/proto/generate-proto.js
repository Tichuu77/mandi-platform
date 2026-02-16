// shared/scripts/proto/generate-proto.js

const { execSync } = require('child_process');

execSync(`
  npx grpc_tools_node_protoc \
    --js_out=import_style=commonjs,binary:./generated \
    --grpc_out=grpc_js:./generated \
    --proto_path=./proto \
    ./proto/*.proto
`, { stdio: 'inherit' });

console.log('Proto files generated successfully.');
