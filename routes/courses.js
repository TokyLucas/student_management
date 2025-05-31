let {Course} = require('../model/schemas');

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

    Course.findByIdAndDelete(courseId)
        .then((deletedCourse) => {
            if (!deletedCourse) {
                return res.status(404).json({ message: 'Course not found' });
            }
            res.json({ message: `Course with id ${deletedCourse.id} deleted successfully!` });
        })
        .catch((err) => {
            res.status(500).send('Error deleting course: ' + err);
        });
}

module.exports = {getAll, create , edit , deleteById};
