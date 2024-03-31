## Download PostgreSQL
  * Visit the official PostgreSQL website: https://www.postgresql.org/download/
  * Download the appropriate installer for your operating system (Windows, macOS, or Linux).
## Start PostgreSQL Service
## Add .env file in the root. Content of env file is:
  * DB_USER=postgres
  * DB_PASSWORD=password
  * DB_HOST=localhost
  * DB_PORT=5432
  * DB_DATABASE=chat-database // Create a new database named chat-database in pgAdmin 4
  * PORT=4000
  * JWT_SECRET= ******* (Provide any text example: SECRETETEXT)
## Run the following commands in the terminal in the followin sequence:
  ### Ensure PostgreSQL server is running locally
  1. npm install (To install packages)
  2. npm run generate (to generate schema, Only first time you are opening the app)
  3. npm run dev (To start )
