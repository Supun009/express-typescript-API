import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'My API Documentation',
    version: '1.0.0',
    description: 'API documentation for my Express TypeScript application',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://api.production.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const outputFile = './swagger_output.json';
const endpointsFiles = [
  './src/routes/indexRoute.ts',
  './src/routes/adminRoute.ts',
  './src/routes/authRoute.ts',
  './src/routes/healthChekroute.ts',
  './src/routes/userRoute.ts',
];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc);
