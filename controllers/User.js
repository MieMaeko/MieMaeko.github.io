import { Database } from "./Database.js";

export class User {
    static login(req,res){
      const { login, pass } = req.body;  
      let connection = Database.connect();
        connection.execute("SELECT * FROM users WHERE login = ? AND pass = ?", [login, pass], 
          (err, resultSet) => {
            if (err) {
                console.error('Database error:', err);
                res.status(500).send('Internal server error');
                return;
            }
            
            if (resultSet.length > 0) {
                req.session.userId = resultSet[0].id; 
                req.session.login = resultSet[0].login;
                req.session.pass = resultSet[0].pass;
                req.session.firstname = resultSet[0].firstname;
                req.session.lastname = resultSet[0].lastname;
                req.session.avatar = resultSet[0].avatar;  
                if (resultSet[0].login == 'admin') {
                  console.log('Redirecting to admin panel...');
                  res.redirect('/admin');  
                } else {
                    res.redirect('/');  
                }
            } else {
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
        pass: req.session.pass,
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
    
    static workAdmin(req, res) {
      if (!req.session.userId || req.session.login !== 'admin') {
          return res.status(403).send('Доступ запрещен');
      }
      let connection = Database.connect();
      connection.execute("SELECT * FROM users", (err, Users) => {
          if (err) {
              console.error('Database error:', err);
              return res.status(500).send('Ошибка базы данных');
          }
          res.render('admin', {Users});   
      });
  }
  static deleteUser(req, res) {
      const userId = req.params.id;
      if (!req.session.userId || req.session.login !== 'admin') {
          return res.status(403).send('Доступ запрещен');
        }
      let connection = Database.connect();
      connection.execute("DELETE FROM users WHERE id = ?", [userId], (err, result) => {
          if (err) {
              console.error('Database error:', err);
              return res.status(500).send('Ошибка базы данных');
          }
          console.log(`User with ID ${userId} deleted`);
          res.redirect('/admin');
      });
  }
  static userComments(req, res) {
    const userId = req.session.userId;  
    if (!userId) {
        return res.redirect('/');  
    }
    let connection = Database.connect();
    connection.execute(
        `SELECT comments.comment, comments.id, comments.show_id, comments.category, 
                CASE 
                    WHEN comments.category = 'movies' THEN movies.name
                    WHEN comments.category = 'series' THEN series.name
                    WHEN comments.category = 'cartoons' THEN cartoons.name
                    ELSE NULL 
                END AS show_name
         FROM comments
         LEFT JOIN movies ON comments.category = 'movies' AND comments.show_id = movies.id
         LEFT JOIN series ON comments.category = 'series' AND comments.show_id = series.id
         LEFT JOIN cartoons ON comments.category = 'cartoons' AND comments.show_id = cartoons.id
         WHERE comments.user_id = ?`,
        [userId],
        (err, comments) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Ошибка при загрузке комментариев');
            }
            res.render('comments', {
                firstname: req.session.firstname,
                lastname: req.session.lastname,
                avatar: req.session.avatar,
                comments: comments  
            });
        }
    );
}

}

export default User;