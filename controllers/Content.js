import { Database } from "./Database.js";
export class Content {
    static async getShows (req,res){
        try {
            const connection = Database.connect();
            connection.execute("SELECT * FROM movies", (err, movies)=> {
                connection.execute("SELECT * FROM series", (err, series)=> {
                    connection.execute("SELECT * FROM cartoons", (err, cartoons)=> {
                        connection.execute("SELECT * FROM main_pics", (err, main)=> {
                        res.render('main', {movies, series, cartoons, main,
                            firstname: req.session.firstname,
                            avatar: req.session.avatar
                        });
                        
                        })
                    })
                })
            })
        }
        catch (err) {
            console.error(err);
            res.status(500).send("Error fetching data");
        }
       
    };
    static getMovieById(req,res){
        const movieId = req.params['movieId']; 
        let connection = Database.connect();
        connection.execute("SELECT * FROM movies WHERE id = ?", [movieId], (err, show) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Ошибка при загрузке фильма");
            }

            connection.execute(
                "SELECT comments.comment, users.firstname, users.lastname, users.avatar, comments.user_id FROM comments " +
                "JOIN users ON comments.user_id = users.id WHERE show_id = ? AND category = 'movies'",
                [movieId],
                (err, comments) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send("Ошибка при загрузке комментариев");
                    }
                    res.render('movie', {
                        show: show[0],
                        comments: comments,  // Список комментариев
                        contentType: 'movie',
                        contentId: movieId,
                        firstname: req.session.firstname,
                        lastname: req.session.lastname,
                        avatar: req.session.avatar,
                        userId: req.session.userId
                    });
                }
            );
        });
    };
    static getSerieById(req,res){
        const serieId = req.params ['serieId'];
        let connection = Database.connect();
        connection.execute("Select * from series where series.id=? ", 
        [serieId],
         (err, show)=> {
            connection.execute(
                "SELECT comments.comment, users.firstname, users.lastname, users.avatar FROM comments " +
                "JOIN users ON comments.user_id = users.id WHERE show_id = ? AND category = 'series'",
                [serieId],
                (err, comments) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send("Ошибка при загрузке комментариев");
                    }
                    
                    res.render('serie', {
                        show: show[0],
                        comments: comments,  // Список комментариев
                        contentType: 'serie',
                        contentId: serieId,
                        firstname: req.session.firstname,
                        lastname: req.session.lastname,
                        avatar: req.session.avatar
                    });
                }
            );
        })
        
    };
    static getCartoonById(req,res){
        const cartoonId = req.params ['cartoonId'];
        let connection = Database.connect();
        connection.execute("Select * from cartoons where cartoons.id=? ", 
        [cartoonId],
         (err, show)=> {
            if (err) {
                console.error(err);
                return res.status(500).send("Ошибка при загрузке фильма");
            }
            connection.execute(
                "SELECT comments.comment, users.firstname, users.lastname, users.avatar FROM comments " +
                "JOIN users ON comments.user_id = users.id WHERE show_id = ? AND category = 'cartoons'",
                [cartoonId],
                (err, comments) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send("Ошибка при загрузке комментариев");
                    }
                    
                    res.render('cartoon', {
                        show: show[0],
                        comments: comments,  // Список комментариев
                        contentType: 'cartoon',
                        contentId: cartoonId,
                        firstname: req.session.firstname,
                        lastname: req.session.lastname,
                        avatar: req.session.avatar
                    });
                }
            );
        })
    };
    static getFilmFromSliderById(req,res){
        const slId = req.params ['slId'];
        let connection = Database.connect();
        connection.execute("Select * from main_pics where main_pics.id=? ", 
        [slId],
         (err, show)=> {
            if (err) {
                console.error(err);
                return res.status(500).send("Ошибка при загрузке фильма");
            }
            connection.execute(
                "SELECT comments.comment, users.firstname, users.lastname, users.avatar FROM comments " +
                "JOIN users ON comments.user_id = users.id WHERE show_id = ? AND category = 'main_pics'",
                [slId],
                (err, comments) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send("Ошибка при загрузке комментариев");
                    }
                    
                    res.render('from_main', {
                        show: show[0],
                        comments: comments,  // Список комментариев
                        contentType: 'from_main',
                        contentId: slId,
                        firstname: req.session.firstname,
                        lastname: req.session.lastname,
                        avatar: req.session.avatar
                    });
                }
            );
        })
    };
    
    static getMovies(req,res){
        const connectionMovies = Database.connect();
        connectionMovies.execute("SELECT * FROM movies", (err, movies)=> {
            res.render('movies', {movies,
                firstname: req.session.firstname,
                avatar: req.session.avatar
            })
        })
    };
    static getSeries(req,res){
        const connectionSeries = Database.connect();
        connectionSeries.execute("SELECT * FROM series", (err, series)=> {
            res.render('series', {series,
                firstname: req.session.firstname,
                avatar: req.session.avatar
            })
        })
    };
    static getCartoons(req,res){
        const connectionCartoons = Database.connect();
        connectionCartoons.execute("SELECT * FROM cartoons", (err, cartoons)=> {
            res.render('cartoons', {cartoons,
                firstname: req.session.firstname,
                avatar: req.session.avatar
            })
        })
    };

    // static getContent(req,res) {
    //     const contentType = req.params;  // Получаем тип контента из параметров URL
    //     const tables = {
    //         'movie': 'movies',
    //         'serie': 'series',
    //         'cartoon': 'cartoons'
    //     };
    //     console.log(contentType)
    //     const table = tables[contentType];

    //     if (!table) {
    //         return res.status(400).send("Некорректный тип контента");
    //     }

    //     const connection = Database.connect();
    //     connection.execute(`SELECT * FROM ${table}`, (err, content) => {
    //         if (err) {
    //             return res.status(500).send("Ошибка при загрузке данных");
    //         }

    //         res.render(contentType, {  // Рендерим соответствующую страницу
    //             [contentType]: content,  // Данные контента (например, фильмы, сериалы или мультфильмы)
    //             firstname: req.session.firstname,
    //             avatar: req.session.avatar
    //         });
    //     });

    // }
    
}



