import { Database } from "./Database.js";

export class User {
    static login(req,res){
      const { login, pass } = req.body;  
      // const redirectTo = req.session.returnTo || '/profile';
      let connection = Database.connect();
        connection.execute("SELECT * FROM users WHERE login = ? AND pass = ?", [login, pass], 
          (err, resultSet) => {
            if (err) {
                console.error('Database error:', err);
                res.status(500).send('Internal server error');
                return;
            }
            
            if (resultSet.length > 0) {
                // Успешная авторизация
                req.session.userId = resultSet[0].id;  // Сохраняем ID пользователя в сессии
                req.session.pass = resultSet[0].pass;
                req.session.firstname = resultSet[0].firstname;
                req.session.lastname = resultSet[0].lastname;
                req.session.avatar = resultSet[0].avatar;  // Сохраняем имя пользователя
                console.log('User authenticated, redirecting to profile...');
                // delete req.session.returnTo;
                res.redirect('/');  // Перенаправляем на страницу профиля
            } else {
                // Ошибка авторизации
                res.status(401).json({ error: 'Неправильный логин или пароль' });
            }
        });
      
        
    };
    static reg (req,res) {
      const { login, firstname, lastname, pass} = req.body;
      let connection = Database.connect();
      connection.execute("SELECT * FROM users WHERE login = ?", 
        [login], (err, resultSet) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).send('Internal server error');
        }
    
        if (resultSet.length > 0) {
          // Логин уже существует
          return res.status(400).json({ error: 'Этот логин уже занят' });
        }
        connection.execute(
          "INSERT INTO users (login, pass, firstname, lastname) VALUES (?, ?, ?, ?)",
          [login, pass, firstname, lastname],
          (err, resultSet) => {
            if (err) {
              console.error('Error saving user:', err);
              return res.status(500).send('Internal server error');
            }
            req.session.userId = resultSet.insertId;
            req.session.login = login;
            req.session.firstname = firstname;
            req.session.lastname = lastname;
            res.redirect('/profile');
          }
        );
      }
      )
      
    };
    static showProfile(req, res) {
      if (!req.session.userId) {
          return res.redirect('/');
      }
      res.render('profile', {
        firstname: req.session.firstname,
        lastname: req.session.lastname,
        avatar: req.session.avatar
      });   
  }
    static logout (req,res) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).send('Failed to log out');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
      });
    }

    static settings (req,res) {
      if (!req.session.userId) {
        return res.redirect('/');
      }
      const userId = req.session.userId;
      res.render('settings', {
        firstname: req.session.firstname,
        lastname: req.session.lastname,
        password: req.session.pass,
        avatar: req.session.avatar
      });
    };

    static settingsChange (req, res) {
      if (!req.session.userId) {
        return res.redirect('/');
      }
      const { firstname, lastname, pass } = req.body; 
      const userId = req.session.userId;
      let avatar = req.session.avatar;  
      if (req.file) {
        avatar = req.file.filename; 
      }
      let connection = Database.connect();
      connection.execute("Update users set firstname=?, lastname =? , pass = ? , avatar = ? where id = ?",
        [ firstname, lastname, pass, avatar, userId,], (err, resultSet) => {
        if (err) {
          console.error("Error executing query:", err); 
          return res.status(500).send('Error updating user data');
        }
        req.session.firstname = firstname;
        req.session.lastname = lastname;
        req.session.pass = pass;
        req.session.avatar = avatar;
        res.redirect('/profile/settings');
      })
    };
    static showUserComments (req,res) {
      const userId = req.session.userId; // ID текущего пользователя (из сессии)

    let connection = Database.connect();
    connection.execute(
        `SELECT comments.comment, shows.title AS show_title, shows.id AS show_id, users.firstname, users.lastname, users.avatar
         FROM comments
         JOIN users ON comments.user_id = users.id
         JOIN shows ON comments.show_id = shows.id
         WHERE comments.user_id = ?`,
        [userId], // Получаем комментарии текущего пользователя
        (err, comments) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Ошибка при загрузке комментариев");
            }

            res.render('/profile/comments', {  
                comments: comments,  
                firstname: req.session.firstname,  
            });
        }
      );
    }
}

export default User;