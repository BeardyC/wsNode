DROP DATABASE IF EXISTS otp_users;
CREATE DATABASE otp_users;

\c otp_users;

CREATE TABLE user_table (
	ID SERIAL PRIMARY KEY,
	u_name VARCHAR,
	u_salt VARCHAR,
	u_secret VARCHAR,
	p_hash VARCHAR,
	u_fname VARCHAR,
	u_lname VARCHAR,
	u_dob VARCHAR,
	u_email VARCHAR,
	u_timestamp VARCHAR
);
INSERT INTO user_table (u_name, u_salt, p_hash, u_fname, u_lname)
	VALUES ('admin','salt','hash','a','d');
	
CREATE TABLE ws_table (
	ID SERIAL PRIMARY KEY,
	ws_name VARCHAR,
	ws_salt VARCHAR,
	ws_hash VARCHAR,
	ws_email VARCHAR,
	ws_timestamp VARCHAR,
	ws_apikey VARCHAR,
	ws_apiValidity VARCHAR
);



INSERT INTO ws_table(ws_name,ws_salt,ws_hash,ws_email,ws_timestamp,ws_apikey,ws_apiValidity)
	VALUES ('name_test','salt_test','hash_test','email_test','timestamp_test','apikey_key','true');
