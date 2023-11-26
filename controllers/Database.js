import mysql from "mysql2";

export class Database {
    static connect (){
        return mysql.createConnection(
            {
              host:"127.0.0.1",
              user:'root',
              password:'1234',
              database:"kp"
            }
          );
    }
}