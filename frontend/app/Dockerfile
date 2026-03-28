FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=http://localhost:5000/api
ARG VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
ARG VITE_CHATBOT_API_URL=http://localhost:5000/api/chatbot/chat

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID
ENV VITE_CHATBOT_API_URL=$VITE_CHATBOT_API_URL

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.d/40-print-links.sh /docker-entrypoint.d/40-print-links.sh
RUN chmod +x /docker-entrypoint.d/40-print-links.sh
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
