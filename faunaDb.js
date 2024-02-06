const faunadb = require('faunadb'), q = faunadb.query;

const faunaClient = new faunadb.Client({ secret: process.env.FAUNA_DB_TOKEN });

module.exports = {
    faunaClient,
    q
};
