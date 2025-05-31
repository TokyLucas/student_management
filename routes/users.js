const mongoose = require('mongoose');
let {User} = require('../model/userSchema');
let { Grade } = require('../model/schemas'); 

function getAll(req, res) {
    User.find().then((users) => {
        res.send(users);
    }).catch((err) => {
        res.send(err);
    });
}

function getAllStudent (req, res) {
    User.find({ role: 'etudiant' })
        .then((students) => {
            res.json(students);
        })
        .catch((err) => {
            console.error("Erreur lors de la récupération des étudiants :", err);
            res.status(500).json({ error: "Impossible de récupérer les étudiants" });
        });
}


function create(req, res) {
    let user = new User();
    user.nom = req.body.nom;
    user.prenom = req.body.prenom;
    user.email = req.body.email;
    user.motDePasse = req.body.motDePasse;
    user.role=req.body.role;
    user.save()
        .then((user) => {
            console.log("User saved:", user);
            res.json({ message: `Utilisateur enregistré avec l'id ${user._id}!` });
        })
        .catch((err) => {
            console.error("Erreur lors de l'enregistrement de l'utilisateur:", err);
            res.status(400).json({ error: "Impossible d'enregistrer l'utilisateur" });
        });
}

function edit(req, res) {
    let userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    const updateData = {
        nom: req.body.nom,
        prenom: req.body.prenom,
        email: req.body.email,
        motDePasse: req.body.motDePasse,
        role:req.body.role
    };

    User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true })
        .then((user) => {
            if (!user) {
                return res.status(404).json({ error: "Utilisateur non trouvé" });
            }
            res.json({ message: `Utilisateur avec l'id ${userId} mis à jour avec succès`, user });
        })
        .catch((err) => {
            console.error("Erreur lors de la mise à jour de l'utilisateur:", err);
            res.status(500).json({ error: "Échec de la mise à jour de l'utilisateur" });
        });
}

function deleteById(req, res) {
    let userId = req.params.id;
        User.findById(userId)
            .then(async (user) => {
                if (!user) {
                    return res.status(404).json({ error: "user not found" });
                }
    
                // Si c'est un étudiant, supprimer ses notes
                if (user.role === 'etudiant') {
                    try {
                        await Grade.deleteMany({ user: userId });
                        console.log(`Notes de l'étudiant ${userId} supprimées`);
                    } catch (err) {
                        console.error("Erreur lors de la suppression des notes :", err);
                        return res.status(500).json({ error: "Erreur lors de la suppression des notes de l'étudiant" });
                    }
                }
    
                // Supprimer l'utilisateur
                return User.findByIdAndDelete(userId);
            })
            .then((deletedUser) => {
                if (!deletedUser) {
                    return res.status(404).json({ error: "user not found after attempt" });
                }
                res.json({ message: `User with id ${userId} and related grades deleted successfully` });
            })
            .catch((err) => {
                console.error("Erreur lors de la suppression de l'utilisateur :", err);
                res.status(500).json({ error: "Failed to delete user" });
            });
}

module.exports = {getAll, create, edit, deleteById , getAllStudent };
