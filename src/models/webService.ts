export class WebService {

    public name         :   string  =   "name";
    public salt         :   string  =   "salt";
    public password     :   string  =   "password";
    public email        :   string  =   "email";
    public timestamp    :   string  =   "timestamp";
    public apikey       :   string  =   "apikey";
    public apivalidity  :   string  =   "apivalidity";



    constructor(name: string = "name", salt: string = "salt", password: string = "password", email: string = "email", timestamp: string = "timestamp", apikey: string = "apikey", apivalidity: string = "apivalidity") {

        this.name           =   (name             === null)   ?   'name'        :   name;
        this.salt           =   (salt             === null)   ?   'salt'        :   salt;
        this.password       =   (password         === null)   ?   'password'    :   password;
        this.email          =   (email            === null)   ?   'email'       :   email;
        this.timestamp      =   (timestamp        === null)   ?   'timestamp'   :   timestamp;
        this.apikey         =   (apikey           === null)   ?   'apikey'      :   apikey;
        this.apivalidity    =   (apivalidity      === null)   ?   'true'        :   apivalidity;
    }



}