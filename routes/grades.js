let {Grade} = require('../model/schemas');

function getAll(req, res) {
    Grade.find({ grade: { $ne: null } })
        .populate('user')
        .populate('course')
        .then((grades) => {
            res.send(grades);
        }).catch((err) => {
        res.send(err);
    });
}


function create(req, res) {
    let grade = new Grade();

    grade.user = req.body.user;
    grade.course = req.body.course;
    grade.grade = req.body.grade;
    grade.date = req.body.date;

    grade.save()
        .then((grade) => {
                res.json({message: `grade saved with id ${grade.id}!`});
            }
        ).catch((err) => {
        console.log(err);
        res.status(400).send('cant post grade ', err.message);
    });
}

function edit(req, res) {
    const updatedGrade = {
        user: req.body.user,
        course: req.body.course,
        grade: req.body.grade,
        date: req.body.date,
    };

    Grade.findByIdAndUpdate(req.params.id, updatedGrade, {
        runValidators: true,
    })
        .then((grade) => {
                res.json({message: `grade with id ${req.params.id} update`});
            }
        ).catch((err) => {
        console.log(err);
        res.status(400).send('cant put grade ', err.message);
    });
}

function deleteById(req, res) {
    Grade.findByIdAndDelete(req.params.id)
        .then((deletedGrade) => {
            if (!deletedGrade) {
                return res.status(404).json({ message: `Grade with id ${req.params.id} not found` });
            }
            res.json({ message: `Grade with id ${req.params.id} deleted`, grade: deletedGrade });
        })
        .catch((err) => {
            console.error(err);
            res.status(400).json({ error: err.message });
        });
}

const getCoursesForStudent = async (req, res) => {
    try {
        const grades = await Grade.find({ user: req.params.id }).populate('course');

        const courses = grades.map(g => g.course);

        const uniqueCourses = Array.from(
            new Map(courses.map(c => [c._id.toString(), c])).values()
        );

        res.status(200).json(uniqueCourses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de la récupération des cours." });
    }
};

const getAllGradesByStudentId = async (req, res) => {
    try {
        const grades = await Grade.find({
            user: req.params.id,
            grade: { $ne: null }
        }).populate('user').populate('course');

        res.status(200).json(grades);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de la récupération des notes." });
    }
}



module.exports = {getAll, create, edit, deleteById , getCoursesForStudent , getAllGradesByStudentId };
