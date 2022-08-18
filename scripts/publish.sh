#!/bin/sh

set -e

npm publish
cd -

cd packages/@vitamin/cli-plugin-eslint
npm publish
cd -

echo "✅ Publish completed"
