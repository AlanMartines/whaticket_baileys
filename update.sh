#!/bin/bash
echo "Updating Whaticket, please wait."

git pull
cd backend
npm install
rm -rf dist
npm run build
npx sequelize db:migrate
cd ../frontend
npm install
rm -rf build
npm run build
pm2 restart unkbot-backend && pm2 restart unkbot-frontend

echo "Update finished. Enjoy!"
