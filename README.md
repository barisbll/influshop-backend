# influshop-backend
Backend of the ecommerce application influshop.

## How to run the project?

Easiest way to run the project is using docker.
First install docker and change your directory to docker-infra

Execute the command:
```sh
docker-compose up
```

If you don't want to use docker then install postgresql and create a table called 'influshop'

After setting up the db start the server

```sh
npm run start:dev
```
