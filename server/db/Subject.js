const { user } = require('pg/lib/defaults');
const { Sequelize, Op}  = require('sequelize');
const db = require('./db');

const Subject = db.define('subject', {
  name: {
    type: Sequelize.STRING 
  }
})

module.exports = Subject;