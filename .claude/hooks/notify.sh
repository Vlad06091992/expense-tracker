#!/bin/bash

# WSL — диалоговое окно через msg.exe
WIN_USER=$(cmd.exe /c "echo %USERNAME%" 2>/dev/null | tr -d '\r')
msg.exe "$WIN_USER" "Claude ждёт вашего ввода" 2>/dev/null || true
