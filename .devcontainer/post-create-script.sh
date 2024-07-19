#!/bin/sh

git submodule update --init --recursive
cd WarsawGTFS/
go build -v warsawgtfs_realtime.go
cd ../

python manage.py migrate
