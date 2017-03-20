FROM node:latest
MAINTAINER linmadan <772181827@qq.com>
COPY ./package.json /home/gridvo-wechat/
WORKDIR /home/gridvo-wechat
RUN ["npm","config","set","registry","http://registry.npm.taobao.org"]
RUN ["npm","install","--save","co@4.6.0"]
RUN ["npm","install","--save","express@4.14.1"]
RUN ["npm","install","--save","kafka-node@1.6.0"]
RUN ["npm","install","--save","rest@2.0.0"]
RUN ["npm","install","--save","underscore@1.8.3"]
RUN ["npm","install","--save","mongodb@2.2.25"]
RUN ["npm","install","--save","gridvo-common-js@0.0.23"]
COPY ./app.js app.js
COPY ./lib lib
VOLUME ["/home/gridvo-wechat"]
ENTRYPOINT ["node"]
CMD ["app.js"]