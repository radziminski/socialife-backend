FROM node:alpine as builder

# Set all permissions
RUN chown -R root /opt
RUN chmod 755 /usr/local/bin/*

WORKDIR '/app'

# Copy package files 
COPY 'package.json' '/app'
COPY 'package-lock.json' '/app'

# Installing dependencies
RUN npm ci

# Copy source code
COPY '.' '/app'

ENV NODE_ENV=production

# Building optimized build
RUN npm run build

# Crearing deploy folder
RUN mkdir '/app/deploy'

# Copying packages and build folders to deploy
COPY 'package.json' '/app/deploy'
COPY 'package-lock.json' '/app/deploy'
RUN cp -r '/app/dist' '/app/deploy'

CMD echo 'Server built.'
