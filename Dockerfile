FROM node:14-alpine as builder

WORKDIR '/app'

# Copy package files 
COPY 'package.json' '/app'
COPY 'package-lock.json' '/app'

# Installing dependencies
RUN npm ci

# Copy source code
COPY '.' '/app/'

ENV NODE_ENV=production

# Building optimized build
RUN npm run build

# Run the app
FROM node:14-alpine

WORKDIR '/app'

# Copying packages and build folders 
COPY --from=builder '/app/package*.json' '/app/'
COPY --from=builder '/app/node_modules' '/app/node_modules/'
COPY --from=builder '/app/dist' '/app/dist/'

CMD ["node", "dist/main.js"]