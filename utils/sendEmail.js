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
        from: '"Pandit Finder" <panditfinder@example.com>', // sender address
        to: "user@user.com", // list of receivers
        subject: "Testing Email", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Testing Email?</b>", // html body
    });

}

module.exports = sendEmail;