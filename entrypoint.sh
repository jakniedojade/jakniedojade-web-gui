#!/bin/sh

SRC_SHA=$(sha256sum "/WarsawGTFS-build/WarsawGTFS/warsawgtfs_realtime" 2>/dev/null | cut -d ' ' -f1)
if [ -f "/WarsawGTFS/warsawgtfs_realtime" ]; then
    DEST_SHA=$(sha256sum "/WarsawGTFS/warsawgtfs_realtime" 2>/dev/null | cut -d ' ' -f1)
else
    DEST_SHA=""
fi

if [ "$SRC_SHA" != "$DEST_SHA" ]; then
    rm -rf /jakniedojade/WarsawGTFS/*
    cp -r /WarsawGTFS-build/WarsawGTFS/. /jakniedojade/WarsawGTFS/
fi

python manage.py migrate
exec python manage.py scrap_api
