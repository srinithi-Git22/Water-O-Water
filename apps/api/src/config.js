module.exports = {
  port: Number(process.env.API_PORT || 3001),
  host: process.env.API_HOST || "127.0.0.1",
  fallbackFeePaise: 500,
  acceptWindowMin: 20,
};
