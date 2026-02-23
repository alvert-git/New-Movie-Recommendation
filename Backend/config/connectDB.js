const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'movie_recommend',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export the promise-based version for cleaner async/await code
module.exports = pool.promise();