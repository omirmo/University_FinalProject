#!/bin/sh

cd "$(dirname "$0")" || exit 1

for interpreter in "./.venv/bin/python" "$HOME/Desktop/yumwise-demo/.venv/bin/python"; do
    if [ -x "$interpreter" ] && "$interpreter" -c 'import streamlit, google.genai, pydantic, httpx' >/dev/null 2>&1; then
        exec "$interpreter" -u -m streamlit run app.py \
            --server.address=127.0.0.1 --server.port=0 --server.headless=false \
            --browser.serverAddress=127.0.0.1 --logger.hideWelcomeMessage=false
    fi
done

printf '%s\n' 'לא נמצאה סביבת Python עם החבילות של YumWise. הוראות ההתקנה נמצאות ב־README.md.'
exit 1
