/**
 * Created by barrett on 8/28/14.
 */

var mysql = require('mysql');
var dbconfig = require('../config/database');

var connection = mysql.createConnection(dbconfig.connection);
connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    // console.log(dbconfig.database);
    // connection.query('CREATE DATABASE ' + dbconfig.database);
    console.log(dbconfig.database);
    
    // console.log(dbconfig.users_table);
    
    // ---------- create users table ----------
    // connection.query('\
    // CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.users_table + '` ( \
    //     `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    //     `username` VARCHAR(20) NOT NULL, \
    //     `password` CHAR(60) NOT NULL, \
    //         PRIMARY KEY (`id`), \
    //     UNIQUE INDEX `id_UNIQUE` (`id` ASC), \
    //     UNIQUE INDEX `username_UNIQUE` (`username` ASC) \
    // )');
    
    // ---------- create file_index table ----------
    connection.query('\
    CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.file_index_table + '` ( \
        `id` int(10) unsigned NOT NULL AUTO_INCREMENT, \
        `user_id` int(10) NOT NULL, \
        `username` varchar(255) NOT NULL, \
        `file_name` varchar(255) NOT NULL, \
        `transaction` varchar(255) NOT NULL, \
        `blockNumber` varchar(255) NOT NULL, \
        `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \
        `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \
        PRIMARY KEY (`id`) \
    )');

    console.log('Success: Database Created!')
    
    connection.end();
});