import { Database } from "./Database.js";
export class Content {
    static getShows (req,res){
        const connection_movies = Database.connect();
        const connection_series = Database.connect();
        const connection_cartoons = Database.connect();
        connection_movies.execute("SELECT * FROM movies", (err, movies)=> {
            connection_series.execute("SELECT * FROM series", (err, series)=> {
                connection_cartoons.execute("SELECT * FROM cartoons", (err, cartoons)=> {
                    connection_series.execute("SELECT * FROM main_pics", (err, main)=> {
                    res.render('main', {movies, series, cartoons, main});
                    })
                })
            })
        })
    };
    static getMovieById(req,res){
        const movieId = req.params ['movieId'];
        let connection = Database.connect();
        connection.execute("Select * from movies where movies.id=? ", 
        [movieId],
         (err, show)=> {
            res.render('movie', {show: show[0]});
        })
    };
    static getSerieById(req,res){
        const serieId = req.params ['serieId'];
        let connection = Database.connect();
        connection.execute("Select * from series where series.id=? ", 
        [serieId],
         (err, show)=> {
            res.render('serie', {show: show[0]});
        })
    };
    static getCartoonById(req,res){
        const cartoonId = req.params ['cartoonId'];
        let connection = Database.connect();
        connection.execute("Select * from cartoons where cartoons.id=? ", 
        [cartoonId],
         (err, show)=> {
            res.render('cartoon', {show: show[0]});
        })
    };
    static getFilmFromSliderById(req,res){
        const slId = req.params ['slId'];
        let connection = Database.connect();
        connection.execute("Select * from main_pics where main_pics.id=? ", 
        [slId],
         (err, show)=> {
            res.render('from_main', {show: show[0]});
        })
    };
    
    static getMovies(req,res){
        const connectionMovies = Database.connect();
        connectionMovies.execute("SELECT * FROM movies", (err, movies)=> {
            res.render('films', {movies})
        })
    };
    static getSeries(req,res){
        const connectionSeries = Database.connect();
        connectionSeries.execute("SELECT * FROM series", (err, series)=> {
            res.render('series', {series})
        })
    };
    static getCartoons(req,res){
        const connectionCartoons = Database.connect();
        connectionCartoons.execute("SELECT * FROM cartoons", (err, cartoons)=> {
            res.render('cartoons', {cartoons})
        })
    }
    
}



