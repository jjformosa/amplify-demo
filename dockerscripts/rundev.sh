#!/bin/bash
img_name="amplify-dev:node-22-alpine"
port_num=5173

# 解析參數
while [ $# -gt 0 ]; do
  case $1 in
    --img_name=*)
      img_name="${1#*=}"
      ;;
    --port_num=*)
      port_num="${1#*=}"
      ;;
  esac
  shift
done
echo "Image name: $img_name"
echo "Port number: $port_num"

docker run -it -p $port_num:$port_num -v .:/app -w /app "$img_name"
