FROM node:16-alpine

# Create the app directory
RUN mkdir -p /app

# Set environment variables based on your provided env file
# These environment variables will be passed into the container
ENV BOT_SERVICE_URL=$BOT_SERVICE_URL \
    BOT_API_TOKEN=$BOT_API_TOKEN \
    PORT=$PORT \
    REDIS_HOST=$REDIS_HOST \
    REDIS_PORT=$REDIS_PORT \
    REDIS_INDEX=$REDIS_INDEX \
    WHATSAPP_VERSION=$WHATSAPP_VERSION \
    WHATSAPP_PHONEID=$WHATSAPP_PHONEID \
    WHATSAPP_TOKEN=$WHATSAPP_TOKEN \
    VERIFY_TOKEN=$VERIFY_TOKEN \
    CHAR_LIMIT=$CHAR_LIMIT \
    WA_PROVIDER_TOKEN=$WA_PROVIDER_TOKEN \
    TELEMETRY_SERVICE_URL=$TELEMETRY_SERVICE_URL \
    API_TOKEN=$API_TOKEN \
    POSTGRES_URL=$POSTGRES_URL \
    APP_ENV=$APP_ENV \
    APP_NAME=$APP_NAME \
    ACTIVITY_SAKHI_URL=$ACTIVITY_SAKHI_URL \
    STORY_SAKHI_URL=$STORY_SAKHI_URL \
    WA_PROVIDER_APPNAME=$WA_PROVIDER_APPNAME \
    WA_PROVIDER_NUMBER=$WA_PROVIDER_NUMBER

# Set the working directory
WORKDIR /app

# Copy the package.json file to the working directory
COPY package.json .

# Ensure the node_modules directory is cleaned up and install dependencies
RUN rm -rf node_modules/
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Remove any local environment files
RUN rm -rf .env.local

# Expose the application port (3010)
EXPOSE 3010

# Run the application
CMD [ "npm", "start" ]
