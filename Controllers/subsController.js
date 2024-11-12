const subsModel = require('../Models/subscriptionModel');
const nodemailer = require('nodemailer');
require('dotenv').config();
const mail = process.env.MAIL_LOGIN;
const pass = process.env.MAIL_PASS;
const mjml2html = require('mjml');
const minify = require('html-minifier-terser').minify;

exports.addSubscriber = async (req, res, next) => {
    const email = req.body.email;
    const db = req.app.locals.db;
    
    try {
        // Check if the email already exists in the database
        const existingSubscriber = await db.collection('subscribers').findOne({ email });

        if (existingSubscriber) {
            // If the email already exists, return an appropriate message
            return res.status(400).json({ message: 'You have already subscribed to the newsletter.' });
        }

        // If email doesn't exist, proceed to add the new subscriber
        await subsModel.addSubscriber(db, email);
        res.status(200).json({ message: 'Subscribed to newsletter successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error subscribing to newsletter' });
    }
};


// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: mail, // Your email address
        pass: pass, // Your email password
    }
});

// Function to send email to subscribers
exports.sendEmailsToSubscribers = async (db, carData) => {
    const subscribers = await subsModel.getSubscriber(db);

    // MJML template for car email
    const mjmlContent = `
        <mjml>
            <mj-body background-color="#f4f4f4">
                <mj-section>
                    <mj-column>
                        <mj-text font-size="24px" font-weight="bold" color="#333333">New Car Available!</mj-text>
                        <mj-divider border-color="#cccccc" />
                        <mj-text font-size="18px" color="#333333"><strong>Make:</strong> ${carData.make}</mj-text>
                        <mj-text font-size="18px" color="#333333"><strong>Model:</strong> ${carData.model}</mj-text>
                        <mj-text font-size="16px" color="#555555"><strong>Description:</strong> ${carData.description}</mj-text>
                        <mj-text font-size="16px" color="#555555">Tip: Hurry up! Check out this car on our website for more details.</mj-text>
                        <mj-button href="https://yourwebsite.com/cars/${carData.id}" background-color="#346DB7" color="#ffffff">View Car Details</mj-button>
                    </mj-column>
                </mj-section>
            </mj-body>
        </mjml>
    `;

    const { html } = mjml2html(mjmlContent);

    // Minify the HTML content
    const minifiedHtml = await minify(html, {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true
    });

    const mailOptions = {
        from: 'Subhan Motors',
        to: subscribers,
        subject: 'New Car Posted!',
        html: minifiedHtml
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log('Error sending email:', error);
        }
    });
};

// Function to send news update to subscribers
exports.sendNewsToSubscribers = async (req, res) => {
    const { title, news } = req.body;
    const db = req.app.locals.db;

    try {
        const subscribers = await subsModel.getSubscriber(db);
        
        // MJML template for the email
        const mjmlContent = `
            <mjml>
                <mj-body background-color="#f4f4f4">
                    <mj-section>
                        <mj-column>
                            <mj-text font-size="20px" color="#333333" font-weight="bold">${title}</mj-text>
                            <mj-divider border-color="#cccccc" />
                            <mj-text font-size="16px" color="#555555">${news}</mj-text>
                            <mj-button href="https://yourwebsite.com" background-color="#346DB7">Read More</mj-button>
                        </mj-column>
                    </mj-section>
                </mj-body>
            </mjml>
        `;
        
        const { html } = mjml2html(mjmlContent); // Convert MJML to HTML
        
        // Minify the HTML content
        const minifiedHtml = await minify(html, {
            collapseWhitespace: true,
            removeComments: true,
            minifyCSS: true,
            minifyJS: true
        });

        const mailOptions = {
            from: 'Subhan Motors',
            to: subscribers,
            subject: title,
            html: minifiedHtml
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log('Error sending email:', error);
            }
        });

        res.status(200).json({ message: "News update sent to all subscribers." });
    } catch (error) {
        console.error("Error sending news to subscribers:", error);
        res.status(500).json({ message: "Error sending news to subscribers" });
    }
};
