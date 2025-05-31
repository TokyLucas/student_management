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

function deleteAllGrades(req, res) {
    Grade.deleteMany({})
    .then(() => {
    res.json({ message: 'Toutes les notes ont été supprimées.' });
    })
    .catch((err) => {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression des notes.', details: err.message });
    });
}


function create(req, res) {
    let grade = new Grade();

    if (!req.body.user || !req.body.course) {
        return res.status(400).json({ error: 'Les champs "user" et "course" sont obligatoires et ne doivent pas être vides.' });
    }

    grade.user = req.body.user;
    grade.course = req.body.course;
    grade.grade = req.body.grade;
    grade.date = req.body.date;

    grade.save()
        .then((grade) => {
                res.json({message: `grade saved with id ${grade.id}!`});
            }
        ).catch((err) => {
        console.error(err);
        res.status(400).json({ error: 'can\'t save', details: err.message });
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

const getGradesBetweenDates = async (startDate, endDate) => {
    try {
        const grades = await Grade.find({
            grade: { $ne: null },
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }).populate('user').populate('course');

        const groupedByStudent = {};

        grades.forEach(g => {
            const userId = g.user._id.toString();

            if (!groupedByStudent[userId]) {
                groupedByStudent[userId] = {
                    student: {
                        nom: g.user.nom,
                        prenom: g.user.prenom,
                        email: g.user.email
                    },
                    notes: [],
                    total: 0,
                    count: 0
                };
            }

            groupedByStudent[userId].notes.push({
                course: {
                    name: g.course.name,
                    code: g.course.code
                },
                grade: g.grade,
                date: g.date.toISOString().split('T')[0]
            });

            groupedByStudent[userId].total += g.grade;
            groupedByStudent[userId].count += 1;
        });

        const result = Object.values(groupedByStudent).map(entry => {
            const moyenne = entry.count > 0 ? entry.total / entry.count : 0;

            let mention = "Insuffisant";
            if (moyenne >= 16) mention = "Très bien";
            else if (moyenne >= 14) mention = "Bien";
            else if (moyenne >= 12) mention = "Assez bien";
            else if (moyenne >= 10) mention = "Passable";

            return {
                student: entry.student,
                notes: entry.notes,
                moyenne: Number(moyenne.toFixed(2)),
                mention
            };
        });

        return result;

    } catch (err) {
        console.error(err);
        throw err;
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



module.exports = {getAll, create, edit, deleteById , getCoursesForStudent , getAllGradesByStudentId , getGradesBetweenDates , deleteAllGrades };
