export class User {
    public name     : string = 'name';
    public fname    : string = 'fname';
    public lname    : string = 'lname';
    public dob      : string = 'dob';
    public email    : string = 'email';
    public password : string = 'password';
    public tstamp   : number = 0;

    constructor(name:string = 'name' , fname:string = 'fname', lname:string= 'lname', dob:string = 'dob' , email:string = 'email' , password:string = 'password', tstamp:number = 0) {
        this.name       = name;
        this.fname      = fname;
        this.lname      = lname;
        this.dob        = dob;
        this.email      = email;
        this.password   = password;
        this.tstamp     = tstamp;
    }

}

