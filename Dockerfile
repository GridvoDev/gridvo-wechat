FROM node:latest
MAINTAINER linmadan <772181827@qq.com>
COPY ./package.json /home/gridvo-wechat/
WORKDIR /home/gridvo-wechat
RUN ["npm","install"]
COPY ./app.js app.js
COPY ./lib lib
COPY ./test test
COPY ./unittest_bcontext.json unittest_bcontext.json
VOLUME ["/home/gridvo-wechat"]
ENTRYPOINT ["node"]
CMD ["app.js"]