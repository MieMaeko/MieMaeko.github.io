import express from "express";
import path from 'path';
import multer from 'multer';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { Content } from "./controllers/Content.js";
import { User } from "./controllers/User.js";
import { Comment} from './controllers/Comment.js'
import fs from 'fs';

const __dirname= path.resolve();
const app = express();
app.use(session({
  secret: 'your-secret-key',  
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.set('view engine','ejs'); 
app.use(express.static(`${__dirname}/public`));
app.use(cookieParser("q"));
// app.use((req,res,next)=>{
//     console.log(req.cookies.session_id);
//     next();
//   });

// app.use((req, res, next) => {
//   // if (!req.session.userId && req.originalUrl !== '/login' && !req.originalUrl.startsWith('/logout')) {
//   //   // Сохраняем текущий URL в сессии, чтобы потом вернуться на эту страницу
//   //   req.session.returnTo = req.originalUrl;
//   //   return res.redirect('/login');  // Перенаправляем на страницу логина
//   // }

//   req.session.returnTo = req.originalUrl;
  
//   next();  
// });

app.get('/', Content.getShows);
app.get('/movies', Content.getMovies);
app.get('/series', Content.getSeries);
app.get('/cartoons', Content.getCartoons);

// app.get('/:contentType', Content.getContent);

app.get('/movie/:movieId', Content.getMovieById, Comment.showComments)
app.get('/serie/:serieId', Content.getSerieById, Comment.showComments)
app.get('/cartoon/:cartoonId', Content.getCartoonById, Comment.showComments)
app.get('/from_main/:slId', Content.getFilmFromSliderById, Comment.showComments)

app.post('/:contentType/:contentId', Comment.addComment);
// app.delete('/delete-comment/:commentId', Comment.deleteComment);
// app.put('/comment/:commentId', Comment.updateComment);



app.post('/login',multer().fields([]), User.login);
app.post('/reg',multer().fields([]), User.reg);
app.get('/admin', User.workAdmin);
app.post('/admin/delete/:id', User.deleteUser);

app.get('/profile', User.showProfile);
app.get('/logout', User.logout);
app.get('/profile/settings', User.settings);
// app.get('/profile/comments', User.showUserComments);
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'public/img/avatars');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname); 
      const filename = Date.now() + ext; 
      cb(null, filename); 
    }
  });
const upload = multer({ storage: storage });
app.post('/profile/settings/change', upload.single('avatar'), User.settingsChange)


app.listen(3000)