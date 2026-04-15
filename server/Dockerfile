# NewsPulse Backend Dockerfile

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 5000

# Run seed first, then start server
CMD node seed.js && npm start
