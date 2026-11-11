#!/bin/bash
# 《山海问道录·天衍棋局》Godot 4 引擎桌面版一键启动脚本

cd "$(dirname "$0")/godot_project" || exit 1

GODOT_BIN="/Applications/Godot_mono.app/Contents/MacOS/Godot"

if [ ! -f "$GODOT_BIN" ]; then
  # 尝试其他常见路径
  if which godot > /dev/null 2>&1; then
    GODOT_BIN="godot"
  elif which godot4 > /dev/null 2>&1; then
    GODOT_BIN="godot4"
  elif [ -f "/Applications/Godot.app/Contents/MacOS/Godot" ]; then
    GODOT_BIN="/Applications/Godot.app/Contents/MacOS/Godot"
  else
    echo "未检测到 Godot 4 安装路径，请使用 Godot 打开 godot_project 目录。"
    exit 1
  fi
fi

echo "=================================================="
echo "  山海问道录 · 天衍棋局 (Godot 4 桌面端)"
echo "  正在启动 Godot 4.7 引擎渲染战场..."
echo "=================================================="

"$GODOT_BIN" --path .
