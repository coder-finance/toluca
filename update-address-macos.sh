#!/bin/sh
echo "Updating addresses from $1 to $2"
sed -i.bak "s/$1/$2/g" backend/.env frontend/constants/index.js contracts/.env && rm ./backend/.env.bak ./frontend/constants/index.js.bak contracts/.env.bak
