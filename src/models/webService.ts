export class WebService {

    public name         : string = "name";
    public salt         : string = "salt";
    public password     : string = "password";
    public email        : string = "email";
    public timestamp    : string = "timestamp";
    public apikey       : string = "apikey";
    public apivalidity  : string = "apivalidity";



    constructor(name: string = "name", salt: string = "salt", password: string = "password", email: string = "email", timestamp: string = "timestamp", apikey: string = "apikey", apivalidity: string = "apivalidity") {

        this.name           = name;
        this.salt           = salt;
        this.password       = password;
        this.email          = email;
        this.timestamp      = timestamp;
        this.apikey         = apikey;
        this.apivalidity    = apivalidity;
    }



}