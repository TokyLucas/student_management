let {Course} = require('../model/schemas');
let { Grade } = require('../model/schemas');

function getAll(req, res) {
    Course.find().then((classes) => {
        res.send(classes);
    }).catch((err) => {
        res.send(err);
    });
}


function create(req, res) {
    let course = new Course();
    if (!req.body.name || !req.body.code) {
        return res.status(400).json({ error: 'Les champs "name" et "code" sont obligatoires et ne doivent pas être vides.' });
    }
    course.name = req.body.name;
    course.code = req.body.code;

    course.save()
        .then((course) => {
                res.json({message: `course saved with id ${course.id}!`});
            }
        ).catch((err) => {
        res.send('cant post course ', err);
    });
}

function edit(req, res) {
    const courseId = req.params.id;

    Course.findById(courseId)
        .then((course) => {
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }

            course.name = req.body.name || course.name;
            course.code = req.body.code || course.code;

            return course.save();
        })
        .then((updatedCourse) => {
            res.json({ message: `Course with id ${updatedCourse.id} updated successfully!` });
        })
        .catch((err) => {
            res.status(500).send('Error updating course: ' + err);
        });
}

function deleteById (req, res) {
    const courseId = req.params.id;

    Course.findById(courseId)
        .then(async (course) => {
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }

            try {
                await Grade.deleteMany({ course: courseId });
                console.log(`Tous les grades liés au cours ${courseId} ont été supprimés.`);
            } catch (err) {
                console.error("Erreur lors de la suppression des grades :", err);
                return res.status(500).json({ error: "Erreur lors de la suppression des notes liées au cours." });
            }

            return Course.findByIdAndDelete(courseId);
        })
        .then((deletedCourse) => {
            if (!deletedCourse) {
                return res.status(404).json({ message: 'Course not found after delete attempt' });
            }
            res.json({ message: `Course with id ${deletedCourse.id} and related grades deleted successfully.` });
        })
        .catch((err) => {
            console.error("Erreur lors de la suppression du cours :", err);
            res.status(500).send('Erreur lors de la suppression du cours : ' + err);
        });
}

module.exports = {getAll, create , edit , deleteById};
