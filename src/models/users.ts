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
        this.name       = (name     === null)   ? 'name'        : name;
        this.fname      = (fname    === null)   ? 'fname'       : fname;
        this.lname      = (lname    === null)   ? 'lname'       : lname;
        this.dob        = (dob      === null)   ? 'dob'         : dob;
        this.email      = (email    === null)   ? 'email'       : email;
        this.password   = (password === null)   ? 'password'    : password;
        this.salt       = (salt     === null)   ? 'salt'        : salt;
        this.tstamp     = (tstamp   === null)   ? '1492085120'  : tstamp;
        this.secret     = (name     === null)   ? 'name'        : name;
    }

}

