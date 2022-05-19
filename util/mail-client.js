const nodemailer = require('nodemailer');
const transport = require('nodemailer-sendgrid-transport');

const API_KEY = 'YOUR_SEND_GRID_API_KEY'

const client = nodemailer.createTransport(transport({
    auth:{
        api_key:API_KEY
    }
}))

module.exports = client;
