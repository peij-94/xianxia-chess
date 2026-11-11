#!/bin/bash
# 《山海问道录·天衍棋局》Web Demo 一键本地运行脚本

cd "$(dirname "$0")/web_demo" || exit 1

PORT=8080
echo "=================================================="
echo "  山海问道录 · 天衍棋局 (Web Demo 原型)"
echo "  正在启动本地仙境棋局预览服务..."
echo "  访问地址: http://localhost:$PORT"
echo "=================================================="

# 检测系统并打开默认浏览器
if which python3 > /dev/null 2>&1; then
  (sleep 1 && open "http://localhost:$PORT" 2>/dev/null || xdg-open "http://localhost:$PORT" 2>/dev/null) &
  python3 -m http.server $PORT
elif which python > /dev/null 2>&1; then
  (sleep 1 && open "http://localhost:$PORT" 2>/dev/null || xdg-open "http://localhost:$PORT" 2>/dev/null) &
  python -m SimpleHTTPServer $PORT
else
  echo "未检测到 Python，直接在浏览器中打开 index.html..."
  open index.html 2>/dev/null || xdg-open index.html 2>/dev/null
fi
