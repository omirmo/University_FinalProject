@echo off
setlocal DisableDelayedExpansion
cd /d "%~dp0" || goto failed

if exist ".venv\Scripts\python.exe" goto packages
py -3.14 -c "import sys" >nul 2>&1
if errorlevel 1 goto check_path
py -3.14 -m venv .venv
if errorlevel 1 goto failed
goto packages

:check_path
python -c "import sys; sys.exit(sys.version_info < (3, 11))" >nul 2>&1
if errorlevel 1 goto missing_python
python -m venv .venv
if errorlevel 1 goto failed

:packages
".venv\Scripts\python.exe" -c "import streamlit, google.genai, pydantic, httpx" >nul 2>&1
if not errorlevel 1 goto launch
echo Installing YumWise dependencies...
".venv\Scripts\python.exe" -m pip install -r requirements.txt
if errorlevel 1 goto failed

:launch
if not defined GEMINI_API_KEY if not exist ".streamlit\secrets.toml" (
    >".streamlit\secrets.toml" echo GEMINI_API_KEY = ""
    start "" /wait notepad.exe ".streamlit\secrets.toml"
)
".venv\Scripts\python.exe" -m streamlit run app.py --server.address=127.0.0.1 --server.port=0 --server.headless=false --browser.serverAddress=127.0.0.1
if errorlevel 1 goto failed
exit /b 0

:missing_python
echo Please install Python for Windows from https://www.python.org/downloads/windows/ and open this file again.
pause
exit /b 1

:failed
echo YumWise could not start. See the error above or open README.md.
pause
exit /b 1
