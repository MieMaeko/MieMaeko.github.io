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
    
    static workAdmin(req, res) {
      if (!req.session.userId || req.session.login !== 'admin') {
          return res.status(403).send('Доступ запрещен');
      }

      let connection = Database.connect();

      connection.execute("SELECT * FROM users", (err, resultSet) => {
          if (err) {
              console.error('Database error:', err);
              return res.status(500).send('Ошибка базы данных');
          }

          let html = `
              <h1>Админ-панель: Управление пользователями</h1>
              <table border="1">
                  <thead>
                      <tr>
                          <th>ID</th>
                          <th>Логин</th>
                          <th>Имя</th>
                          <th>Фамилия</th>
                          <th>Действия</th>
                      </tr>
                  </thead>
                  <tbody>
          `;
          resultSet.forEach(user => {
              html += `
                  <tr>
                      <td>${user.id}</td>
                      <td>${user.login}</td>
                      <td>${user.firstname}</td>
                      <td>${user.lastname}</td>
                      <td>
                          <form action="/admin/delete/${user.id}" method="POST">
                              <button type="submit">Удалить</button>
                          </form>
                      </td>
                  </tr>
              `;
          });
          html += `</tbody></table>`;
          res.send(html);
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
}

export default User;