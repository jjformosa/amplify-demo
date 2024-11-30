#!/bin/sh
# 檢查是否提供了 --force 參數
FORCE_INSTALL=false
for arg in "$@"
do
  if [ "$arg" = "--force" ]; then
    FORCE_INSTALL=true
    break
  fi
done

echo $FORCE_INSTALL

# 以 node_modeuls 為指標，如果node_modeuls不存在則執行安裝套件
if [ ! -d "node_modules" ] || [ "$FORCE_INSTALL" = true ] ; then
  npm install
fi

# 啟動服務
npm run dev