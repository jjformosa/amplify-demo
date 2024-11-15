#!/bin/bash

img_name="amplify-dev:node-22-alpine"

# 解析參數
while [ $# -gt 0 ]; do
  case $1 in
    --img_name=*)
      img_name="${1#*=}"
      ;;
  esac
  shift
done
echo "Image name: $img_name"

docker build -f Dockerfile.dev -t "$img_name" .
