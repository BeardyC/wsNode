import * as redis from 'redis';
import * as crypto from 'crypto';
import * as uuid from 'uuid';
import * as promise from 'bluebird';
import * as User from "../models/users";

let options = {
    promiseLib: promise
}
var pgp = require('pg-promise')(options);
let cn = {
    host: 'localhost',
    port: '5432',
    database: 'otp_users',
    user: 'xyz',
    password: 'admin'
};
//var connString = 'postgres://localhost:5432/otp_users';
let db = pgp(cn);

export enum ResponseStatus { SUCCESS, ERROR };
export class Response { public constructor(public status: ResponseStatus, public content: any) { } };

export default class TFA {

    private db: redis.RedisClient;
    private hashValidity: number;
    private hashAlgo: string;
    private hashLength: number;



    public constructor(hashValidity: number, hashAlgo: string, hashLength: number) {
        this.db = redis.createClient();

        this.db.on("error", function (err) {
            console.log("REDIS ERROR:", err);
        });

        this.hashValidity = hashValidity;
        this.hashAlgo = hashAlgo;
        this.hashLength = hashLength;

    }

    private generateTimestamp() {
        return Math.floor(new Date().getTime() / 1000);
    }

    public getAll(callback: (Response) => void) {
        db.any('select * from user_table')
            .then(function (data) {
                console.log(data);
                callback(new Response(ResponseStatus.SUCCESS, { output: data }));
            })
            .catch(function (err) {
                callback(new Response(ResponseStatus.ERROR, { data: err }));
            });
    }

    public createUserPostGres(user: User.User, callback: (Response) => void) {
        console.log("Name passed    :   ", user.name);
        console.log("password passed    :   ", user.password);

        db.one('select * from user_table where u_name = ${name}', {name: user.name})
            .then(data => {
                console.log("FOUND IT");
                let x = data;
                //callback(new Response(ResponseStatus.SUCCESS, {data: "Found it"}));

                   //user.tstamp = this.generateTimestamp();
                   //console.log("USER GENERATING TIMESTAMP....   :   ", user.tstamp);
                   /* db.none('insert into user_table(u_name, u_salt, u_hashed, u_fname, u_lname, u_dob, u_email, u_timestamp)' +
                        'values (${name},${fname},${lname},${dob},${email},${password},${},)')
                        .then(function () {
                            callback(new Response(ResponseStatus.SUCCESS, { data: 'Inserted record!' }));
                        })
                        .catch(function (err) {
                            callback(new Response(ResponseStatus.ERROR, { data: err }));
                        })*/
                    return x;
                        

            })
            .then(x => {
                console.log("in here");
                user.tstamp = this.generateTimestamp();
                console.log(user.tstamp);
                console.log('DATA')
                console.log(x);
                callback(new Response(ResponseStatus.SUCCESS, {data: "Found it and generated!", returned: x}));
                
            })

/*
        user.tstamp = this.generateTimestamp();
        db.none('insert into user_table(u_name, u_salt, u_hashed, u_fname, u_lname, u_dob, u_email, u_timestamp)' +
            'values (${name},${fname},${lname},${dob},${email},${password},${},)')
            .then(function () {
                callback(new Response(ResponseStatus.SUCCESS, { data: 'Inserted record!' }));
            })*/
            .catch(function (err) {
                console.log("DIDNT FIND IT");
                callback(new Response(ResponseStatus.ERROR, { data: err }));
            })
    }


    public createUser(username: string, password: string, callback: (Response) => void) {
        this.db.get(username, (err, reply) => {
            console.log("Username   :   ", username);
            console.log("Password   :   ", password);
            console.log(err, reply);
            console.log("DONE THIND HERE");
            if (reply === null) {

                let hash = crypto.createHash("sha256");
                hash.update(crypto.randomBytes(128));
                this.db.set(username, this.generateTimestamp());
                this.db.set(username + "_salt", hash.digest("hex"));
                let hashp = crypto.createHash("sha256")
                hashp.update(password);
                this.db.set(username + "_hashed", hashp.digest("hex"));

                callback(new Response(ResponseStatus.SUCCESS, "User created successfuly"));

            } else {

                callback(new Response(ResponseStatus.ERROR, "User already exists"));
            }
        });
    }

    public checkUser(username: string, password: string, callback: (Response) => void) {
        this.db.get(username, (err, reply) => {
            console.log(err, reply);
            console.log("Username  :   ", reply);
            this.db.get(username + "_salt", (err, reply) => {
                console.log("User Salt  :   ", reply);
                this.db.get(username + "_hashed", (err, reply) => {
                    console.log("User hash  :   ", reply);
                    callback(new Response(ResponseStatus.SUCCESS, "Yay"));
                })

            })
        })
    }

    public checkCode(username: string, code: string, callback: (Response) => void) {

    }

    public createWebservice(servicename: string, password: string, callback: (Response) => void) {
        this.db.get(servicename, (err, reply) => {
            console.log(err, reply);
            let apikey = uuid.v4();
            console.log(apikey);
            //let hash = crypto.createHash("sha256");

            this.db.set(servicename, servicename);
            let x = this.hash(password);
            console.log("x  :   ", x);
            this.db.set(servicename + "_password", this.hash(password));
            this.db.set(servicename + "_apiKey", apikey);

            callback(new Response(ResponseStatus.SUCCESS, "Webservice created successfuly"));

        });
    }

    public hash1(data: string, callback) {
        const hash = crypto.createHash('sha256');
        console.log("DATA   :   ", data)
        console.log("Hashing    :   ", hash.update(data));

        callback(hash.digest("hex"));
    }


    public hash(data: string) {
        const hash = crypto.createHash('sha256');
        console.log("DATA   :   ", data)
        console.log("Hashing    :   ", hash.update(data));

        return (hash.digest("hex").toString());
    }



    public getApiKey(servicename: string, callback: (Response) => void) {
        this.db.get(servicename, (err, reply) => {
            if (reply === null) {
                callback(new Response(ResponseStatus.ERROR, "Webservice not registered"));
            } else {
                this.db.get(servicename + "_apiKey", (err, reply) => {
                    if (reply === null) {
                        callback(new Response(ResponseStatus.ERROR, "Key Does not exist"));
                    } else {
                        let apikey = reply;
                        callback(new Response(ResponseStatus.SUCCESS, { servicename: servicename, apiKey: apikey }));
                    }
                });
            }
        })
    }

    public generate(username: string, callback: (Response) => void) {
        this.db.get(username, (err, reply) => {
            if (reply === null) {
                callback(new Response(ResponseStatus.SUCCESS, "Username doesn't exist"));
            } else {
                let epoch = parseInt(reply);
                this.db.get(username + "_salt", (err, reply) => {
                    if (reply === null) {
                        callback(new Response(ResponseStatus.SUCCESS, "Fatal error"));
                    } else {
                        let hash = crypto.createHash(this.hashAlgo);
                        let salt = reply;
                        let iteration = Math.floor((this.generateTimestamp() - epoch) / this.hashValidity);
                        hash.update(salt + iteration);
                        let authCode = hash.digest("hex").substr(0, this.hashLength);
                        callback(new Response(ResponseStatus.SUCCESS, { code: authCode, it: iteration }));
                    }
                });
            }
        });
    }




}