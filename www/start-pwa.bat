@echo off
echo ========================================
echo Bbangmodoro - New Neon Design Preview
echo ========================================
echo.
echo Starting local server...
echo Open your browser at: http://localhost:8000
echo.
echo Press Ctrl+C to stop
echo.

start http://localhost:8000
python -m http.server 8000
