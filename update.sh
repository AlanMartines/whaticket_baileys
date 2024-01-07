#!/bin/bash
echo "Updating Whaticket, please wait."

git pull
cd backend
rm -rf dist
rm -fr package-lock.json
npm install
npm run build
npx sequelize db:migrate
cd ../frontend
rm -rf build
rm -fr package-lock.json
npm install
npm run build
pm2 restart unkbot-backend && pm2 restart unkbot-frontend

echo "Update finished. Enjoy!"
