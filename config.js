require('dotenv').config();

module.exports = {
    DB_URL: process.env.DB_LINK || 'URL',
    API_Token: process.env.API_Token || "bot api token "
};
