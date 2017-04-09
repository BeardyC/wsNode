DROP DATABASE IF EXISTS otp_users;
CREATE DATABASE otp_users;

\c otp_users;

CREATE TABLE user_table (
	ID SERIAL PRIMARY KEY,
	u_name VARCHAR,
	u_salt VARCHAR,
	p_hash VARCHAR,
	u_fname VARCHAR,
	u_lname VARCHAR,
	u_dob VARCHAR,
	u_email VARCHAR,
	u_timestamp VARCHAR
);

INSERT INTO user_table (u_name, u_salt, p_hash, u_fname, u_lname)
	VALUES ('admin','salt','hash','a','d');

