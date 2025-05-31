const PDFDocument = require('pdfkit');

const generatePdfBuffer = (student, notes, moyenne, mention) => {
    return new Promise((resolve, reject) => {
        const buffers = [];
        const doc = new PDFDocument({ margin: 50 });
  
      doc.on('data', (data) => buffers.push(data));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
  
      doc
        .fontSize(16)
        .fillColor('#000')
        .text("Bulletin de notes", { align: "center" })
        .moveDown();
  
      doc
        .fontSize(12)
        .text(`Nom : ${student.nom}`)
        .text(`Prénom : ${student.prenom}`)
        .text(`Email : ${student.email}`)
        .moveDown();
  
      doc
        .fontSize(13)
        .text("Détail des notes :", { underline: true })
        .moveDown(0.5);
  
      const tableTop = doc.y;
  
      doc
        .font('Helvetica-Bold')
        .text("Cours", 50, tableTop)
        .text("Note", 300, tableTop)
        .text("Date", 400, tableTop)
        .moveDown();
  
      doc.font('Helvetica');
  
      notes.forEach(note => {
        const y = doc.y;
        doc
          .text(`${note.course.name} (${note.course.code})`, 50, y)
          .text(note.grade.toString(), 300, y)
          .text(note.date, 400, y)
          .moveDown(0.5);
      });
  
      doc
        .moveDown(1)
        .font('Helvetica-Bold')
        .text(`Moyenne Générale : ${moyenne}`, { align: 'left' })
        .text(`Mention : ${mention}`, { align: 'left' })
        .moveDown(2);
  
      doc
        .fontSize(10)
        .font('Helvetica-Oblique')
        .text("Fait le " + new Date().toLocaleDateString(), { align: 'right' })
        .text("Le Directeur", { align: 'right' });
  
      doc.end();
    });
  };
  
  module.exports = generatePdfBuffer;
  