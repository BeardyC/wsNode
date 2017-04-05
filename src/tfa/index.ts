import * as redis from 'redis';
import * as crypto from 'crypto';

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


    public createUser(username: string,password:string, callback: (Response) => void) {
        this.db.get(username, (err, reply) => {
            console.log(err, reply);
            if (reply === null) {
                let hash = crypto.createHash("sha256");
                hash.update(crypto.randomBytes(128));
                this.db.set(username, this.generateTimestamp());
                this.db.set(username + "_salt", hash.digest("hex"));
                callback(new Response(ResponseStatus.SUCCESS, "User created successfuly"));
            } else {
                callback(new Response(ResponseStatus.ERROR, "User already exists"));
            }
        });
    }




}