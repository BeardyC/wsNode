export class User {
    public name     : string = 'name';
    public fname    : string = 'fname';
    public lname    : string = 'lname';
    public dob      : string = 'dob';
    public email    : string = 'email';
    public password : string = 'password';
    public tstamp   : string = '0';
    public salt     : string = 'salt';
    public secret   : string = 'secret';

    constructor(name:string = 'name' , fname:string = 'fname', lname:string = 'lname', dob:string = 'dob' , email:string = 'email' , password:string = 'password',salt:string = 'salt', tstamp:string = '0', secret:string = 'secret') {
        this.name       = name;
        this.fname      = fname;
        this.lname      = lname;
        this.dob        = dob;
        this.email      = email;
        this.password   = password;
        this.salt       = salt;
        this.tstamp     = tstamp;
        this.secret     = secret;
    }

}

