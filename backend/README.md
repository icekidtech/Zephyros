<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Zephyros Backend

<p align="center">
  <strong>Backend API service for the Zephyros platform</strong>
</p>

<p align="center">
  Built with <a href="http://nestjs.com/" target="_blank">NestJS</a> - a progressive Node.js framework for building efficient and scalable server-side applications.
</p>

## Description

Zephyros Backend is a RESTful API service that powers the Zephyros platform. It provides data management, authentication, and business logic implementation.

## Project setup

```bash
$ npm install
```

## Running the application

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Testing

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Project Structure

```
src/
├── config/       # Application configuration
├── controllers/  # API route controllers
├── dto/          # Data transfer objects
├── entities/     # Database entity models
├── guards/       # Authentication guards
├── interfaces/   # TypeScript interfaces
├── middlewares/  # Request middlewares
├── modules/      # Feature modules
├── repositories/ # Data access layer
├── services/     # Business logic services
├── utils/        # Helper functions
└── main.ts       # Application entry point
```

## API Documentation

API documentation is available at `/api/docs` when running the application in development mode.

## Deployment

For deployment instructions, please refer to our internal deployment guide or contact the DevOps team.

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io/)
- [Jest Testing Framework](https://jestjs.io/)

## License

This project is proprietary and confidential. Unauthorized copying of files, via any medium is strictly prohibited.
