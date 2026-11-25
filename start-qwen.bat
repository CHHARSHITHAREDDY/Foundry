@echo off
title Qwen Local AI Runner (Zero Cost, Zero Limits)
echo ========================================================
echo   Starting Local Qwen2.5-Coder-7B-Instruct Server
echo   Target: NVIDIA RTX 5050 (8GB VRAM) / Local GPU
echo   Cost: $0.00 / Unlimited Token Ingestion
echo ========================================================
echo.

C:\Users\giris\AppData\Local\Programs\Python\Python314\python.exe scripts/serve_qwen.py
pause
