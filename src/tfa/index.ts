import * as redis from 'redis';
import * as crypto from 'crypto';
import * as uuid from 'uuid';
//var parse = require('pg-connection-string').parse;

//var config1 = parse('postgres://xyz@localhost:5432/xyz')
//let connectionString = process.env.DATABASE_URL || "postgres://localhost:5432/xyz";
//import * as pg1 from 'pg';
//const pg = require('pg');

/*let config = {
    user:   'xyz',
    database: 'xyz',
    password: '',
    host: 'localhost',
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000
};
const pool = new pg1.Client(config1);*/

//const Client = new pg.Client(connectionString);


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


    public createUser(username: string, password: string, callback: (Response) => void) {
        this.db.get(username, (err, reply) => {
            console.log("Username   :   ", username);
            console.log("Password   :   ", password);
            console.log(err, reply);
            if (reply === null) {

                let hash = crypto.createHash("sha256");
                hash.update(crypto.randomBytes(128));
                this.db.set(username, this.generateTimestamp());
                this.db.set(username + "_salt", hash.digest("hex"));
                let phash = this.hash1(password,(err,reply)=>{

                console.log("phash  :   ",phash);

                this.db.set(username+ "_hashed", phash, (err,reply)=>{
                    if (reply ===null){
                        callback(new Response(ResponseStatus.SUCCESS, "Couldn't save"))
                    }else{
                        callback(new Response(ResponseStatus.SUCCESS, "asdf"));
                    }
                });

                });
               /* this.db.get(username + "_salt", (err, reply) => {
                    console.log("salt : " + reply);

                });*/
                //console.log("NOT HASHED",password + this.db.get(username + "_salt"));
                //console.log("HASHEd",this.hash(password + this.db.get(username + "_salt"),callback));
                //this.db.set(username+"_p_h", this.hash(password+this.db.get(username + "_salt"),callback));

                //let data = password + reply;
                //let hashed = this.hash(data,callback)
                //console.log("DIGESTED   :   ");
                /*                this.hash(data, function (hashed) {
                                    console.log("Hashed     :   ", hashed);
                                    this.db.set(password, hashed);
                                })*/

               
            } else {

                callback(new Response(ResponseStatus.ERROR, "User already exists"));
            }
        });
    }

    public checkUser(username: string, password: string, callback: (Response) => void) {
            this.db.get(username,(err,reply)=>{
                console.log(err,reply);
                console.log("Username  :   ",reply);
                this.db.get(username+"_salt", (err, reply) => {
                    console.log("User Salt  :   ", reply);
                    this.db.get(username+"_hashed", (err, reply)=>{
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

        return(hash.digest("hex").toString());
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