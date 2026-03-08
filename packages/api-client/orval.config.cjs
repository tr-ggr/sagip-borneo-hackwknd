module.exports = {
  wiraApi: {
    input: {
      target: './openapi/openapi.json',
    },
    output: {
      mode: 'single',
      target: './src/generated/api-client.ts',
      client: 'axios',
      clean: true,
      prettier: true,
    },
  },
};
