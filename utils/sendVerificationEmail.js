const nodemailer = require('nodemailer')

const sendEmail = async(req, res) => {

    let testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'kasey.runolfsdottir@ethereal.email',
            pass: 'ZVq5fDB4XCFbSg6Zyr'
        }
    });

    let info = await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: "bar@example.com, baz@example.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
    });

}

module.exports = sendEmail;