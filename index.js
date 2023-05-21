export const handler = async (event, context) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello Lambda'),
  };
  return response;
};
