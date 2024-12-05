import { Database } from "./Database.js";
export class Comment {
    static addComment(req, res) {
        console.log(req.body)
        const userId = req.session.userId;  // ID текущего пользователя из сессии
        const comment = req.body.comment;   // Текст комментария
        const contentId = req.params.contentId;  // ID контента (фильм, сериал и т.д.)
        const contentType = req.params.contentType;  // Тип контента (movie, serie, cartoon)
        console.log(contentType)
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
            `SELECT comments.comment, users.firstname, users.lastname, users.avatar 
             FROM comments 
             JOIN users ON comments.user_id = users.id 
             WHERE show_id = ? AND category = ?`,
            [contentId, contentType],
            (err, comments) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send("Ошибка при загрузке комментариев");
                }
                console.log(comments);
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
    
    static deleteComment (req,res) {
        const commentId = req.params.commentId;
        const userId = req.session.userId;

        console.log("Received request to delete comment with ID:", commentId);
        console.log("User ID from session:", userId);

        if (!userId) {
            console.error("User not authenticated.");
            return res.status(403).json({ success: false, message: "Пользователь не авторизован" });
        }

        let connection = Database.connect();
        connection.execute(
            'SELECT user_id FROM comments WHERE comment_id = ?',
            [commentId],
            (err, result) => {
                if (err) {
                    console.error("Error executing query:", err);
                    return res.status(500).json({ success: false, message: "Ошибка при проверке владельца комментария" });
                }

                if (result.length === 0) {
                    console.error("Comment not found in database.");
                    return res.status(404).json({ success: false, message: "Комментарий не найден" });
                }

                if (result[0].user_id !== userId) {
                    console.error("User does not have permission to delete this comment.");
                    return res.status(403).json({ success: false, message: "Недостаточно прав для удаления комментария" });
                }

                // Удаляем комментарий из базы данных
                connection.execute(
                    'DELETE FROM comments WHERE comment_id = ?',
                    [commentId],
                    (err) => {
                        if (err) {
                            console.error("Error deleting comment:", err);
                            return res.status(500).json({ success: false, message: "Ошибка при удалении комментария" });
                        }
                        console.log("Comment deleted successfully.");
                        res.json({ success: true });
                    }
                );
            }
        );
    }
    
}
export default Comment;