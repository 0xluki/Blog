const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const mongoDBStore = require('connect-mongodb-session')(session);
const multer = require('multer');
const methodOverride = require('method-override');
const  moment = require('moment');


const User = require('./models/user');

const blogRoutes = require('./routes/blog');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/admin');

const errorContoller = require('./controllers/error');

const MONGO_URI = 'YOUR_MONGO_DB_URI';
const PORT = 3000 || process.env.PORT;

// new mongoDBStore
const store = new mongoDBStore({
    uri:MONGO_URI,
    collection:'sessions'
});

// storing images
const fileStorage = multer.diskStorage({
    destination:(req, file, cb) => {
        cb(null, 'images');
    },
    filename:(req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    }
});

// filtering images
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null, true);
    }
    else{
        cb(null, false);
    }
};

const app = express();

app.locals.moment = moment;

// setting templating engine => ejs
app.set('view engine', 'ejs');

// Session
app.use(session({
    secret:'keyboard cat',
    resave:false,
    saveUninitialized:true,
    store:store
}))

// checking for user auth
app.use((req, res, next) => {
    if (!req.session.user) {
      return next();
    }
  
    User.findById(req.session.user._id)
      .then(user => {
        req.user = user;
        next();
      })
      .catch(err => console.log(err));
  });

// Setting public
app.use(express.static(path.join(__dirname, 'public')));

// Setting images file
app.use('/images', express.static(path.join(__dirname, 'images')));

// method override to use all methods
app.use(methodOverride('_method'));

app.use(flash());

app.use(bodyParser.urlencoded({extended:true}));

// multer for images
app.use(multer({storage:fileStorage, fileFilter:fileFilter}).single('image'));

// Blog routes
app.use(blogRoutes);

// Authentication routes
app.use(authRoutes);

// User routes
app.use(userRoutes);

// Profile Routes
app.use('/profile', profileRoutes);

// Posts routes
app.use('/posts', postRoutes);

// Admin routes
app.use('/admin', adminRoutes);

// 404
app.use(errorContoller.get404);

// Connecting mongo
mongoose.connect(MONGO_URI)
.then(() => {
    console.log('database connected successfully');
    app.listen(PORT, () => {console.log(`Server running on port ${PORT}`)});
})
.catch((err) => {
    console.log(err);
});
