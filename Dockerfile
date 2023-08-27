# Get NPM packages
FROM node:16-alpine AS dependencies
ARG GEOLITE2_LICENSE_KEY
ARG NEXT_PUBLIC_SHORT_DOMAIN
CMD ["echo", "NEXT_PUBLIC_SHORT_DOMAIN=$NEXT_PUBLIC_SHORT_DOMAIN"]
WORKDIR /app
COPY package.json yarn.lock prisma .env scripts/update_ip_db.sh ./
RUN npm install
# add sharp for image production
RUN npm install sharp
# Update IP Database
# ENV GEOLITE2_LICENSE_KEY ${GEOLITE2_LICENSE_KEY}
# RUN ./update_ip_db.sh


# Rebuild the source code only when needed
FROM dependencies AS builder
WORKDIR /app
COPY . .
RUN if [ "$NEXT_PUBLIC_SHORT_DOMAIN" = "true" ] ; then ./scripts/short_clean_build.sh; else echo 'Keep building original src'; fi
RUN npm run build
# COPY ./prod.env ./.env
# RUN npm run db:push
RUN chmod -R 777 ./prisma

# Production image, copy all the files and run next
FROM builder AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_PUBLIC_SHORT_DOMAIN $NEXT_PUBLIC_SHORT_DOMAIN

EXPOSE 3000
RUN node -v

CMD ["npm", "start"]
