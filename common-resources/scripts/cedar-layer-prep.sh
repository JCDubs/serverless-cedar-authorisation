#!/usr/bin/env bash

echo "Preparing the dist directory..."
rm -rf ./dist
mkdir -p ./dist/cedar-layer/nodejs/node_modules/@cedar-policy/cedar-wasm
echo "Copying the Cedar WASM package to the dist directory..."
cp -r ./node_modules/@cedar-policy/cedar-wasm/nodejs ./dist/cedar-layer/nodejs/node_modules/@cedar-policy/cedar-wasm
echo "CopyingCedar WASM Lambda Layer peperation complete."
