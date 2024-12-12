import { Database } from "./Database.js";
export class Comment {
    static addComment(req, res) {
        const userId = req.session.userId; 
        const comment = req.body.comment;   
        const contentId = req.params.contentId;  
        const contentType = req.params.contentType;  
        let connection = Database.connect();

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

        connection.execute(
            `INSERT INTO comments (comment, show_id, user_id, category) VALUES (?, ?, ?, ?)`,
            [comment, contentId, userId, table],
            (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send("Ошибка при добавлении комментария");
                }
                res.redirect(`/${contentType}/${contentId}`);  
            }
        );
    }
    static deleteComment(req, res) {
        const commentId = req.params.commentId; 
        const userId = req.session.userId; 
    
        let connection = Database.connect();
        connection.execute(
            `SELECT user_id FROM comments WHERE id = ?`,
            [commentId],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send("Ошибка при проверке комментария");
                }
    
                if (result.length === 0) {
                    return res.status(404).send("Комментарий не найден");
                }
                connection.execute(
                    `DELETE FROM comments WHERE id = ?`,
                    [commentId],
                    (err) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).send("Ошибка при удалении комментария");
                        }
                        res.send({ success: true });  
                    }
                );
            }
        );
    }
    static updateComment(req, res) {
        if (!req.session.userId) {
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
                connection.execute(
                    'UPDATE comments SET comment = ? WHERE id = ?',
                    [newCommentText, commentId],
                    (err) => {
                        if (err) {
                            return res.status(500).json({ error: 'Ошибка при сохранении комментария' });
                        }
                        res.json({ success: true }); 
                    }
                );
            }
        );
    }
    

}
export default Comment;