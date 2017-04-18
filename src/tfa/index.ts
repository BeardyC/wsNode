import * as crypto from 'crypto';
import * as uuid from 'uuid';
import * as promise from 'bluebird';
import * as User from "../models/users";
import * as WS from "../models/webService";

let options = {
    promiseLib: promise
}
var pgp = require('pg-promise')(options);
let cn = {
    host: 'localhost',
    port: '5432',
    database: 'otp_users',
    user: 'postgres',
    password: 'admin'
};
//var connString = 'postgres://localhost:5432/otp_users';
let db = pgp(cn);

export enum ResponseStatus { SUCCESS, ERROR };
export class Response { public constructor(public status: ResponseStatus, public content: any) { } };

export default class TFA {
    private hashValidity: number;
    private hashAlgo: string;
    private hashLength: number;



    public constructor(hashValidity: number, hashAlgo: string, hashLength: number) {

        this.hashValidity = hashValidity;
        this.hashAlgo = hashAlgo;
        this.hashLength = hashLength;

    }

    private generateTimestamp() {
        return Math.floor(new Date().getTime() / 1000);
    }

    public getUsers(callback: (Response) => void) {
        db.any('select * from user_table')
            .then(function (data) {
                console.log(data);
                return data;

            })
            .then(data => {
                callback(new Response(ResponseStatus.SUCCESS, { output: data }));
            })
            .catch(function (err) {
                callback(new Response(ResponseStatus.ERROR, { data: err }));
            });
    }

    public edituser(user: User.User, callback: (Response) => void) {
        console.log(user);

        db.one("SELECT * FROM user_table WHERE u_name = ${name}", user)
            .then(function () {
                db.none("UPDATE user_table SET u_fname = ${fname}, u_lname = ${lname}, u_dob = ${dob}, u_email = ${email} WHERE u_name = ${name}", user)
                    .then(function () {
                        callback(new Response(ResponseStatus.SUCCESS, { data: null }));
                    })
                    .catch(function (err) {
                        callback(new Response(ResponseStatus.ERROR, { data: err }));
                    })

            })
            .catch(function (err) {
                callback(new Response(ResponseStatus.ERROR, { data: err }));
            })
    }

    public editWS(ws: WS.WebService, callback: (Response) => void) {
        console.log(ws);


        db.one("SELECT * from ws_table WHERE ws_name = ${name}", ws)
            .then(function () {
                db.none("UPDATE ws_table SET  ws_email = ${email} WHERE ws_name = ${name}", ws)
                    .then(function () {
                        callback(new Response(ResponseStatus.SUCCESS, { data: null }));
                    })
                    .catch(function (err) {
                        callback(new Response(ResponseStatus.ERROR, { data: err }));
                    })

            })
            .catch(function (err) {
                callback(new Response(ResponseStatus.ERROR, { data: err }));
            })

    }



    public deleteUser(user: User.User, callback: (Response) => void) {
        db.one("SELECT * FROM user_table WHERE u_name = ${name}", user)
            .then(function () {
                db.none("DELETE from user_table WHERE u_name = ${name}", user)
                    .then(function (data) {
                        callback(new Response(ResponseStatus.SUCCESS, { data: "DELETED USER" }));
                    })
                    .catch(function (err) {
                        console.log(err)
                        callback(new Response(ResponseStatus.ERROR, { data: "ERROR DELETING" }));
                    })

            })
            .catch(function (err) {
                callback(new Response(ResponseStatus.ERROR, { data: err }));
            })
    }

    public deleteWS(ws: WS.WebService, callback: (Response) => void) {
        db.none("DELETE from ws_table WHERE ws_name = ${name}", ws)
            .then(function () {
                callback(new Response(ResponseStatus.SUCCESS, { data: null }));
            })
            .catch(function () {
                callback(new Response(ResponseStatus.ERROR, { data: null }));
            })
    }



    public getAllWS(callback: (Response) => void) {
        db.any('SELECT * FROM ws_table')
            .then(function (data) {
                console.log(data);
                callback(new Response(ResponseStatus.SUCCESS, { data: data }));
            })
            .catch(function (err) {
                callback(new Response(ResponseStatus.ERROR, { data: err }));
            })
    }

    public loginUser(user, callback: (Response) => void) {
        console.log(user);
        let _this = this;
        db.one("SELECT u_name, u_ FROM user_table WHERE u_name = ${name}", user)
            .then(function (data) {
                let serverhash = _this.hashpassword(user.password, data.u_salt, 1000);
                console.log(serverhash);
                if (serverhash == data.p_hash) {
                    callback(new Response(ResponseStatus.SUCCESS, { equal: true }));
                } else {
                    callback(new Response(ResponseStatus.ERROR, { equal: false }));
                }
            })
            .catch(function (err) {
                callback(new Response(ResponseStatus.ERROR, { err: err, msg: "Invalid User" }));
            })
    }

    public loginFromMobile(user, callback: (Response) => void) {
        console.log(user);
        let _this = this;
        db.one("SELECT u_name,u_salt,u_secret,u_timestamp,p_hash FROM user_table WHERE u_name = ${name}", user)
            .then(function (data) {
                let serverhash = _this.hashpassword(user.password, data.u_salt, 1000);
                
                console.log(serverhash);
                console.log(data.p_hash);
                let x = {u_name : data.u_name, u_salt: data.u_salt, u_secret: data.u_secret, u_timestamp : data.u_timestamp}
                if (serverhash == data.p_hash) {
                    callback(new Response(ResponseStatus.SUCCESS, { data: x, equal: true }));
                } else {
                    callback(new Response(ResponseStatus.ERROR, { equal: false }));
                }
            })
            .catch(function (err) {
                callback(new Response(ResponseStatus.ERROR, { err: err, msg: "Invalid User" }));
            })
    }

    public loginWS(ws, callback: (Response) => void) {
        console.log(ws);
        let _this = this;
        db.one("SELECT * FROM ws_table WHERE ws_name = ${name}", ws)
            .then(function (data) {
                let serverhash = _this.hashpassword(ws.password, data.ws_salt, 1000);
                console.log(serverhash);
                if (serverhash == data.ws_hash) {
                    callback(new Response(ResponseStatus.SUCCESS, { equal: true }));
                } else {
                    callback(new Response(ResponseStatus.ERROR, { equal: false }));
                }
            })
            .catch(function (err) {
                callback(new Response(ResponseStatus.ERROR, { err: err, msg: "Invalid User" }));
            })
    }


    public verifyPassword(user: User.User, callback: (Response) => void) {
        console.log(user);
        let x = this;
        db.one("SELECT * FROM user_table WHERE u_name = ${name}", user)
            .then(function (data) {

                let serverHash = x.hashpassword(user.password, data.u_salt, 1000);

                console.log(data);
                console.log("HASHED FROM DATABASE:  ", data.p_hash);
                //let y = x.hashpassword(user.password,data.u_salt,1000);
                //console.log("HASHED FROM SERVER:    ", y);

                if (serverHash == data.p_hash) {
                    callback(new Response(ResponseStatus.SUCCESS, { data: data, equal: true }));
                } else {
                    callback(new Response(ResponseStatus.ERROR, { data: data, equal: false }));
                }
            })
            .catch(function (err) {
                callback(new Response(ResponseStatus.ERROR, { err: err, equal: false }));
            });
    }

    public verifyAPIkey(ws: WS.WebService, callback: (Response) => void) {

        db.one("SELECT * FROM ws_table WHERE ws_apikey = ${apikey}", ws)
            .then(function (data) {
                let wsname = data.ws_name;
                let today = new Date();
                let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
                let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                let dateTime = date + ' ' + time;
                let message = "API request made by " + wsname + " at " + dateTime;
                callback(new Response(ResponseStatus.SUCCESS, { data: data, message: message, valid: true }));
            }).catch(function (err) {
                callback(new Response(ResponseStatus.ERROR, { err: err, valid: false }));
            })
    }

    public registerWS(ws: WS.WebService, callback: (Response) => void) {
        ws.timestamp = this.generateTimestamp().toString();
        ws.salt = crypto.createHash("sha256").update(crypto.randomBytes(128)).digest("hex");
        ws.password = this.hashpassword(ws.password, ws.salt, 1000);
        ws.apikey = uuid.v4();
        console.log(ws);
        db.none("SELECT ws_name FROM ws_table WHERE ws_name = ${name}", ws)
            .then(function () {
                db.none("INSERT INTO ws_table(ws_name, ws_salt, ws_hash, ws_email, ws_timestamp, ws_apikey, ws_apiValidity)" +
                    "VALUES(${name}, ${salt}, ${password}, ${email}, ${timestamp}, ${apikey}, ${apivalidity})", ws)
                    .then(function () {
                        console.log("INSERTED   :   ", ws);
                        callback(new Response(ResponseStatus.SUCCESS, { data: 'Successfully registered webservice' }))
                    })
            })
            .catch(function (err) {
                callback(new Response(ResponseStatus.ERROR, { data: err }))
            })


    }

    public registerUser(user: User.User, callback: (Response) => void) {

        user.tstamp = this.generateTimestamp().toString();
        console.log(user.tstamp);
        user.salt = crypto.createHash("sha256").update(crypto.randomBytes(128)).digest("hex");
        user.secret = crypto.createHash("sha256").update(crypto.randomBytes(128)).digest("hex");
        user.password = this.hashpassword(user.password, user.salt, 1000);

        /*//just check username for name, replace with line udner to check for email
        db.none("SELECT u_name, u_email FROM user_table WHERE u_name = ${name} OR u_email = ${email}", user)*/
        db.none("SELECT u_name FROM user_table WHERE u_name = ${name}", user)
            .then(function () {
                console.log(user);

                db.none("INSERT INTO user_table(u_name, u_salt, u_secret, p_hash, u_fname, u_lname, u_dob, u_email, u_timestamp)" +
                    "VALUES(${name}, ${salt}, ${secret}, ${password}, ${fname}, ${lname}, ${dob}, ${email}, ${tstamp})", user)
                    .then(function () {
                        //console.log(data);
                        console.log('Inserted   :   ', user);
                        callback(new Response(ResponseStatus.SUCCESS, { data: 'Inserted  user' }))
                    }).catch(function (err) {

                        callback(new Response(ResponseStatus.ERROR, { data: 'ERROR INSERTING', err: err }));
                    })

            }).catch(function (err) {
                console.log("User already exists");
                callback(new Response(ResponseStatus.ERROR, { data: 'User already exists', err: err }));
            })
    }



    public checkCode(username: string, code: string, callback: (Response) => void) {
        let _this = this;
        db.one("SELECT u_salt,u_timestamp,u_secret FROM user_table WHERE u_name = ${name}", { name: username })
            .then(function (data) {
                console.log(data);
                let it = (_this.generateTimestamp() - Number(data.u_timestamp)) / _this.hashValidity;
                let x = crypto.pbkdf2Sync(data.u_secret, data.u_salt, it, 20, _this.hashAlgo).toString('hex').substring(0, _this.hashLength + 1);
                if (x == code) {
                    callback(new Response(ResponseStatus.SUCCESS, { valid: true }));

                } else {
                    callback(new Response(ResponseStatus.SUCCESS, { valid: false }));
                }

            })
            .catch(function (err) {
                callback(new Response(ResponseStatus.ERROR, { data: err }))
            })
    }
    public generateOtp(username: string, callback: (Response) => void) {
        console.log(username);
        let _this = this;
        let user = new User.User(username, null, null, null, null, null, null, null, null);
        console.log(user);
        db.one("SELECT u_timestamp,u_salt, u_secret FROM user_table WHERE u_name = ${name}", { name: username })
            .then(function (data) {

                let it = (_this.generateTimestamp() - Number(data.u_timestamp)) / _this.hashValidity;
                let x = crypto.pbkdf2Sync(data.u_secret, data.u_salt, it, 20, _this.hashAlgo).toString('hex').substring(0, _this.hashLength + 1);
                callback(new Response(ResponseStatus.SUCCESS, { data: x, valid: true }));
            })
            .catch(function (err) {
                callback(new Response(ResponseStatus.ERROR, { data: "Unrecognised user", valid: false }))
            })
    }


    public hashpassword(password: string, salt: string, it: number): string {
        return crypto.pbkdf2Sync(password, salt, it, 20, this.hashAlgo).toString('hex');

    }

    public calculateOTP(password: string, salt: string, it: number): string {
        return crypto.pbkdf2Sync(password, salt, it, 20, this.hashAlgo).toString('hex')
    }

}