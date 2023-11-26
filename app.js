import express from "express";
import path from 'path';
import { Content } from "./controllers/Content.js";
import fs from 'fs';

const __dirname= path.resolve();
const app = express();

app.set('view engine','ejs'); 
app.use(express.static(`${__dirname}/public`));
app.get('/', Content.getShows);
app.get('/films', Content.getMovies);
app.get('/series', Content.getSeries);
app.get('/cartoons', Content.getCartoons);
app.get('/movie/:movieId', Content.getMovieById)
app.get('/serie/:serieId', Content.getSerieById)
app.get('/cartoon/:cartoonId', Content.getCartoonById)
app.get('/from_main/:slId', Content.getFilmFromSliderById)
app.listen(3000)