const createTestAccount = require('../config/nodemailer');
const { getGradesBetweenDates } = require('./grades');
const generatePdfBuffer = require('../service/pdfservice'); 
const nodemailer = require('nodemailer');

exports.sendBulletins = async (req, res) => {
    const { startDate, endDate } = req.body;
  
    try {
      const bulletins = await getGradesBetweenDates(startDate, endDate);
      const { transporter, testAccount } = await createTestAccount();

      if (!bulletins || bulletins.length === 0) {
        return res.status(204).json({ message: "Aucun bulletin à envoyer pour cette période." });
      }
  
      for (const bulletin of bulletins) {
        const pdfBuffer = await generatePdfBuffer(
          bulletin.student,
          bulletin.notes,
          bulletin.moyenne,
          bulletin.mention
        );
  
        const info = await transporter.sendMail({
          from: '"Student Management" <mialiniainacarine2@gmail.com>',
          to: bulletin.student.email,
          subject: "Votre bulletin de notes",
          text: "Veuillez trouver ci-joint votre bulletin.",
          attachments: [
            {
              filename: "bulletin.pdf",
              content: pdfBuffer,
            }
          ]
        });
  
        console.log(`Message envoyé à ${bulletin.student.email}`);
        console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
      }
  
      res.status(200).json({ message: "Emails envoyés " });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur lors de l'envoi des bulletins" });
    }
  };