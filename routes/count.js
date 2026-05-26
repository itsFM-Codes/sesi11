var express = require('express');
var mysql = require('mysql2/promise');
require('dotenv').config();

var router = express.Router();

var mySqlUrl = process.env.MYSQL_URL;
if (!mySqlUrl) {
    console.error('MYSQL URL Gaada')
    process.exit(1);
}

var pool = mysql.createPool(mySqlUrl)
var dbReady = initDB();

dbReady.catch(function (error) {
    console.error(error)
    process.exit(1);
})

router.get('/count', async function(req, res, next) {
    try {
        await dbReady;
        var rows = await pool.query('SELECT value FROM counter WHERE id = 1');
        var data = rows[0];
        var value = data.length ? data[0].value : 0;
        res.json({ value: value });
    } catch (err) {
        next(err)
    }
})

router.post('/increment', async function(req, res, next) {
    try {
        await dbReady;
        await pool.query('UPDATE counter SET value = value + 1 WHERE id = 1')
        var rows = await pool.query('SELECT value FROM counter WHERE id = 1');
        var data = rows[0];
        var value = data.length ? data[0].value : 0;
        res.json({ value: value });
    } catch (err) {
        next(err);
    }
})

module.exports = router;

async function initDB() {
    await pool.query(
        'CREATE TABLE IF NOT EXISTS counter (id INT PRIMARY KEY, value INT NOT NULL)'
    );
    await pool.query(
        'INSERT INTO counter(id, value) VALUES (1, 0) ON DUPLICATE KEY UPDATE value = value'
    );
}