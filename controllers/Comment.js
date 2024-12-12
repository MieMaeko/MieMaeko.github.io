import { Database } from "./Database.js";
export class Comment {
    static addComment(req, res) {
        const userId = req.session.userId;  // ID текущего пользователя из сессии
        const comment = req.body.comment;   // Текст комментария
        const contentId = req.params.contentId;  // ID контента (фильм, сериал и т.д.)
        const contentType = req.params.contentType;  // Тип контента (movie, serie, cartoon)
        let connection = Database.connect();
    
        // Определяем таблицу в зависимости от типа контента
        const contentTypeToTable = {
            'movie': 'movies',
            'serie': 'series',
            'cartoon': 'cartoons',
            'from_main': 'main_pics'
        };
        
        const table = contentTypeToTable[contentType];
        
        if (!table) {
            return res.status(400).send("Некорректный тип контента");
        }
    
        // Вставляем комментарий в базу данных
        connection.execute(
            `INSERT INTO comments (comment, show_id, user_id, category) VALUES (?, ?, ?, ?)`,
            [comment, contentId, userId, table],
            (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send("Ошибка при добавлении комментария");
                }
                res.redirect(`/${contentType}/${contentId}`);  // Перенаправляем на страницу контента
            }
        );
    }
    static showComments(req, res) {
        const contentId = req.params.contentId;  // ID контента
        const contentType = req.params.contentType;  // Тип контента (movie, serie)

        let connection = Database.connect();

        // Запрос на получение комментариев с информацией о пользователе
        connection.execute(
            `SELECT comments.comment, users.firstname, users.lastname, users.avatar, comments.id 
             FROM comments 
             JOIN users ON comments.user_id = users.id 
             WHERE show_id = ? AND category = ?`,
            [contentId, contentType],
            (err, comments) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send("Ошибка при загрузке комментариев");
                }
                console.log(comments[0].id)
                res.render(`${contentType}/${contentId}`, {  // Отправляем данные на рендер страницы
                    show: show[0],  // Данные о контенте (фильм или сериал)
                    comments: comments,  // Список комментариев
                    contentType: contentType,  // Тип контента
                    firstname: req.session.firstname,  // Имя пользователя из сессии
                    lastname: req.session.lastname,  // Фамилия пользователя из сессии
                    avatar: req.session.avatar  // Аватар пользователя
                });
        }
    );
    };
    static deleteComment(req, res) {
        const commentId = req.params.commentId;  // Получаем ID комментария
        const userId = req.session.userId;  // ID текущего пользователя из сессии
    
        let connection = Database.connect();
    
        // Проверяем, является ли пользователь владельцем комментария
        connection.execute(
            `SELECT user_id FROM comments WHERE id = ?`,
            [commentId],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send("Ошибка при проверке комментария");
                }
    
                // Если комментарий не найден
                if (result.length === 0) {
                    return res.status(404).send("Комментарий не найден");
                }
    
                // Удаляем комментарий
                connection.execute(
                    `DELETE FROM comments WHERE id = ?`,
                    [commentId],
                    (err) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).send("Ошибка при удалении комментария");
                        }
    
                        res.send({ success: true });  // Отправляем успешный ответ
                    }
                );
            }
        );
    }
    static updateComment(req, res) {
        if (!req.session.userId) {
            // Если пользователь не авторизован, отправляем ошибку в формате JSON
            return res.status(403).json({ error: 'Вы не авторизованы для редактирования комментария' });
        }
    
        const commentId = req.params.commentId;
        const newCommentText = req.body.comment;
        const userId = req.session.userId;
        let connection = Database.connect();
        connection.execute(
            'SELECT * FROM comments WHERE id = ?',
            [commentId],
            (err, result) => {
                if (err || result.length === 0) {
                    return res.status(500).json({ error: 'Ошибка при получении комментария' });
                }
                const comment = result[0];
                // Обновление комментария
                connection.execute(
                    'UPDATE comments SET comment = ? WHERE id = ?',
                    [newCommentText, commentId],
                    (err) => {
                        if (err) {
                            return res.status(500).json({ error: 'Ошибка при сохранении комментария' });
                        }
                        res.json({ success: true });  // Ответ в формате JSON
                    }
                );
            }
        );
    }
    

}
export default Comment;