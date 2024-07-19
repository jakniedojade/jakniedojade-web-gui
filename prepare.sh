#!/bin/sh


echo "prepare.sh: Setting up submodules"
(git submodule init && git submodule update --recursive) || (echo "Error: This script is not being run from the repo directory. Please first change to repo directory."; exit 1)


echo "prepare.sh: Compiling WarsawGTFS go programs"
cd WarsawGTFS/
go build -v warsawgtfs_realtime.go
cd ../
