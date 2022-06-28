FROM node:latest
WORKDIR /src
ADD ./src /src
RUN npm install
EXPOSE 3000
CMD npm start
