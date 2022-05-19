const nodemailer = require('nodemailer');
const transport = require('nodemailer-sendgrid-transport');

const client = nodemailer.createTransport(transport({
    auth:{
        api_key:'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'
    }
}))

module.exports = client;