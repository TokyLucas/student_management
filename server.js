let express = require('express');
let cors = require('cors');
let cookieParser = require('cookie-parser');
let app = express();
let bodyParser = require('body-parser');
let userHelper = require('./helper/userHelper');
let OAuth2Server = require('oauth2-server');

let oauth = require('./routes/auth');
let user = require('./routes/users');
let course = require('./routes/courses');
let grade = require('./routes/grades');

let mongoose = require('mongoose');
mongoose.Promise = global.Promise;
//mongoose.set('debug', true);

// TODO remplacer toute cette chaine par l'URI de connexion à votre propre base dans le cloud
const uri = 'mongodb+srv://sarobidy:NSXeIUL9vtaUMpyy@cluster0.ypcx6va.mongodb.net/ecole?retryWrites=true&w=majority';

const options = {};

mongoose.connect(uri, options)
    .then(() => {
            console.log("Connexion à la base OK");
            userHelper.createDefaultUser();
        },
        err => {
            console.log('Erreur de connexion: ', err);
        });

app.use(cookieParser()); 
// Pour accepter les connexions cross-domain (CORS)
app.use(function (req, res, next) {
    // res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

app.use(cors({
    origin: ['http://localhost:5173','https://frontend-production-bba3.up.railway.app/'],
    credentials: true
}));

// Pour les formulaires
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

let port = process.env.PORT || 8010;

//initialize the oauth server with a model representing the user principle
//the model servers as the entity to query users from databases or LDAP or Active Directory
let oauthServer = new OAuth2Server({
    model: require('./model/auth-model'),
    allowBearerTokensInQueryString: true
});

app.route('/oauth/login')
    .post(oauth.getToken(oauthServer));
app.route('/oauth/logout')
    .post(oauth.logout);
// app.use('/api', oauth.secure(oauthServer));

// les routes
const prefix = '/api';
let secure = oauth.secure(oauthServer, ['etudiant']);

app.route(prefix + '/users')
    .get(user.getAll)
    .post(secure, user.create);
app.route(prefix + '/users/:id')
    .delete(secure, user.deleteById)
    .put(secure, user.edit);

app.route(prefix + '/courses')
    .get(course.getAll)
    .post(secure, course.create);
app.route(prefix + '/courses/:id')
    .put(secure, course.edit)
    .delete(secure, course.deleteById);

app.route(prefix + '/grades')
    .get(grade.getAll)
    .post(secure, grade.create)
app.route(prefix + '/grades/:id')
    .put(secure, grade.edit)
    .delete(secure, grade.deleteById)
    .get(grade.getAllGradesByStudentId);

app.route(prefix + '/studentcourse/:id')
    .get(secure, grade.getCoursesForStudent)

app.route( prefix + '/students')
    .get(user.getAllStudent);

// On démarre le serveur
app.listen(port, "0.0.0.0");
console.log('Serveur démarré sur http://localhost:' + port);

module.exports = app;


