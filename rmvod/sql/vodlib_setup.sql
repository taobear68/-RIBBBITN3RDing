

-- # vodlib_setup.sql  Copyright 2022, 2023 Paul Tourville

-- # This file is part of RIBBBITmedia VideoOnDemand (a.k.a. "rmvod").

-- # RIBBBITmedia VideoOnDemand (a.k.a. "rmvod") is free software: you 
-- # can redistribute it and/or modify it under the terms of the GNU \
-- # General Public License as published by the Free Software Foundation, 
-- # either version 3 of the License, or (at your option) any later 
-- # version.

-- # RIBBBITmedia VideoOnDemand (a.k.a. "rmvod") is distributed in the 
-- # hope that it will be useful, but WITHOUT ANY WARRANTY; without even 
-- # the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR 
-- # PURPOSE. See the GNU General Public License for more details.

-- # You should have received a copy of the GNU General Public License 
-- # along with RIBBBITmedia VideoOnDemand (a.k.a. "rmvod"). If not, 
-- # see <https://www.gnu.org/licenses/>.

-- # VERSION 0.2.0


create database if not exists vodlib;

use vodlib;

CREATE TABLE IF NOT EXISTS artifacts (
    artifactid VARCHAR(40) NOT NULL PRIMARY KEY,
    title VARCHAR (200) NOT NULL,
    majtype VARCHAR (20) NOT NULL,
    runmins INT NOT NULL DEFAULT -1,
    season INT NOT NULL DEFAULT -1,
    episode  INT NOT NULL DEFAULT -1,
    file VARCHAR (100) NOT NULL,
    filepath VARCHAR (200) NOT NULL,
    director TEXT,
    writer TEXT,
    primcast TEXT,
    relorg TEXT,
    relyear INT NOT NULL DEFAULT -1,
    eidrid VARCHAR (50),
    imdbid VARCHAR (50),
    arbmeta TEXT NOT NULL DEFAULT '{"string":"string"}'
);

 -- ADDED IN r0.2.0
CREATE TABLE IF NOT EXISTS playlog_live (
    clientid VARCHAR(100) NOT NULL,
    artifactid VARCHAR(40) NOT NULL,
    reqtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    comment VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS tags (
    tag VARCHAR(50) NOT NULL PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS persons (
    personname VARCHAR(100) NOT NULL PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS companies (
    companyname VARCHAR(100) NOT NULL PRIMARY KEY
);

 -- Title-To-ArtifactID Reference Table
CREATE TABLE IF NOT EXISTS n2a (
    title VARCHAR(50) NOT NULL,
    artifactid VARCHAR(40) NOT NULL
);

 -- Series-To-Episodes Join Table 
CREATE TABLE IF NOT EXISTS s2e (
    seriesaid VARCHAR(40) NOT NULL,
    episodeaid VARCHAR(40) NOT NULL
);

CREATE TABLE IF NOT EXISTS p2a (
    personname VARCHAR(100) NOT NULL,
    artifactid VARCHAR(40) NOT NULL,
    artifield VARCHAR(50) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS p2a_comp_pk ON p2a (
    personname,
    artifactid,
    artifield
);

CREATE TABLE IF NOT EXISTS c2a (
    companyname VARCHAR(100) NOT NULL,
    artifactid VARCHAR(40) NOT NULL,
    artifield VARCHAR(50) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS c2a_comp_pk ON c2a (
    companyname,
    artifactid,
    artifield
);

 -- TagName-To-Artifact Join Table
CREATE TABLE IF NOT EXISTS t2a (
    tag varchar(50) NOT NULL,
    artifactid VARCHAR(40) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS t2a_comp_pk ON t2a (
    tag,
    artifactid
);

CREATE TABLE IF NOT EXISTS artitexts (
    artifactid VARCHAR(40) NOT NULL,
    artifield VARCHAR(50) NOT NULL,
    artitext MEDIUMTEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS artitexts_comp_pk ON artitexts (
    artifactid,
    artifield
);


CREATE USER IF NOT EXISTS vodlibapi IDENTIFIED BY 'vodlibapipw';
flush privileges;
-- GRANT vodlib.* ON vodlib to vodlibapi;
-- flush privileges;
GRANT ALL PRIVILEGES ON vodlib.* TO 'vodlibapi'@'localhost' IDENTIFIED BY 'vodlibapipw';





INSERT INTO artifacts SET 
    artifactid = "4cf2d6f7-f887-4a82-9b06-022bd2a88f7d",
    title = "Good Night, And Good Luck",
    majtype = "movie",
    runmins = 93,
    season = -1,
    episode = -1,
    file = "GoodNightAndGoodLuck.m4v",
    filepath = "boats",
    director = "string",
    writer = "string", -- ":["George Clooney","Grant Heslov"],
    primcast = "string", -- ["David Strathairn","Patricia Clarkson","George Clooney","Jeff Daniels","Robert Downey, Jr.","Frank Langella","Tate Donovan","Ray Wise"],
    relorg = "string", -- ":["2929 Entertainment","Participant Productions","Section Eight Productions","Davis Films","Redbus Pictures","Tohokushinsha"],
    relyear = 2005,
    eidrid = "string",
    imdbid = "tt0433383",
    arbmeta = '{"string":"string"}'
;

INSERT INTO persons SET personname = "George Clooney";
INSERT INTO persons SET personname = "Grant Heslov";
INSERT INTO persons SET personname = "David Strathairn";
INSERT INTO persons SET personname = "Jeff Daniels";
INSERT INTO persons SET personname = "Robert Downey, Jr.";
INSERT INTO persons SET personname = "Frank Langella";
INSERT INTO persons SET personname = "Tate Donovan";
INSERT INTO persons SET personname = "Ray Wise";
INSERT INTO persons SET personname = "Patricia Clarkson";
 -- INSERT INTO persons SET personname = "";

INSERT INTO p2a SET personname = "George Clooney", artifield = 'director', artifactid = '4cf2d6f7-f887-4a82-9b06-022bd2a88f7d'; 
INSERT INTO p2a SET personname = "George Clooney", artifield = 'writer', artifactid = '4cf2d6f7-f887-4a82-9b06-022bd2a88f7d'; 
INSERT INTO p2a SET personname = "Grant Heslov", artifield = 'writer', artifactid = '4cf2d6f7-f887-4a82-9b06-022bd2a88f7d'; 
INSERT INTO p2a SET personname = "George Clooney", artifield = 'primcast', artifactid = '4cf2d6f7-f887-4a82-9b06-022bd2a88f7d'; 
INSERT INTO p2a SET personname = "David Strathairn", artifield = 'primcast', artifactid = '4cf2d6f7-f887-4a82-9b06-022bd2a88f7d'; 
INSERT INTO p2a SET personname = "Jeff Daniels", artifield = 'primcast', artifactid = '4cf2d6f7-f887-4a82-9b06-022bd2a88f7d'; 
INSERT INTO p2a SET personname = "Robert Downey, Jr.", artifield = 'primcast', artifactid = '4cf2d6f7-f887-4a82-9b06-022bd2a88f7d'; 
INSERT INTO p2a SET personname = "Frank Langella", artifield = 'primcast', artifactid = '4cf2d6f7-f887-4a82-9b06-022bd2a88f7d'; 
INSERT INTO p2a SET personname = "Tate Donovan", artifield = 'primcast', artifactid = '4cf2d6f7-f887-4a82-9b06-022bd2a88f7d'; 
INSERT INTO p2a SET personname = "Ray Wise", artifield = 'primcast', artifactid = '4cf2d6f7-f887-4a82-9b06-022bd2a88f7d'; 
INSERT INTO p2a SET personname = "Patricia Clarkson", artifield = 'primcast', artifactid = '4cf2d6f7-f887-4a82-9b06-022bd2a88f7d'; 
 -- INSERT INTO p2a SET personname = "", artifield = '', artifactid = '4cf2d6f7-f887-4a82-9b06-022bd2a88f7d'; 

INSERT INTO companies SET companyname = "2929 Entertainment";
INSERT INTO companies SET companyname = "Participant Productions";
INSERT INTO companies SET companyname = "Section Eight Productions";
INSERT INTO companies SET companyname = "Davis Films";
INSERT INTO companies SET companyname = "Redbus Pictures";
INSERT INTO companies SET companyname = "Tohokushinsha";
 -- INSERT INTO companies SET companyname = "";

INSERT INTO c2a SET companyname = "2929 Entertainment", artifield = "relorg", artifactid = "4cf2d6f7-f887-4a82-9b06-022bd2a88f7d";
INSERT INTO c2a SET companyname = "Participant Productions", artifield = "relorg", artifactid = "4cf2d6f7-f887-4a82-9b06-022bd2a88f7d";
INSERT INTO c2a SET companyname = "Section Eight Productions", artifield = "relorg", artifactid = "4cf2d6f7-f887-4a82-9b06-022bd2a88f7d";
INSERT INTO c2a SET companyname = "Davis Films", artifield = "relorg", artifactid = "4cf2d6f7-f887-4a82-9b06-022bd2a88f7d";
INSERT INTO c2a SET companyname = "Redbus Pictures", artifield = "relorg", artifactid = "4cf2d6f7-f887-4a82-9b06-022bd2a88f7d";
INSERT INTO c2a SET companyname = "Tohokushinsha", artifield = "relorg", artifactid = "4cf2d6f7-f887-4a82-9b06-022bd2a88f7d";
 -- INSERT INTO c2a SET companyname = "", artifield = "relorg", artifactid = "4cf2d6f7-f887-4a82-9b06-022bd2a88f7d";

INSERT INTO tags SET tag = "action";
INSERT INTO tags SET tag = "based_on_a_true_story";
INSERT INTO tags SET tag = "behind_the_scenes";
INSERT INTO tags SET tag = "cold_war";
INSERT INTO tags SET tag = "comedy";
INSERT INTO tags SET tag = "disaster";
INSERT INTO tags SET tag = "documentary";
INSERT INTO tags SET tag = "drama";
INSERT INTO tags SET tag = "foreign";
INSERT INTO tags SET tag = "holiday";
INSERT INTO tags SET tag = "horror";
INSERT INTO tags SET tag = "intrigue";
INSERT INTO tags SET tag = "mockumentary";
INSERT INTO tags SET tag = "music";
INSERT INTO tags SET tag = "mystery";
INSERT INTO tags SET tag = "post-apocalypse";
INSERT INTO tags SET tag = "science_fiction";
INSERT INTO tags SET tag = "vietnam_war";
INSERT INTO tags SET tag = "world_war_2";
 -- INSERT INTO tags SET tag = "";
 
 
INSERT INTO t2a SET tag = 'based_on_a_true_story', artifactid = '4cf2d6f7-f887-4a82-9b06-022bd2a88f7d';
INSERT INTO t2a SET tag = 'cold_war', artifactid = '4cf2d6f7-f887-4a82-9b06-022bd2a88f7d';
INSERT INTO t2a SET tag = 'intrigue', artifactid = '4cf2d6f7-f887-4a82-9b06-022bd2a88f7d';
 -- INSERT INTO t2a SET tag = '', artifactid = '';


 -- "action", "based_on_a_true_story", "behind_the_scenes", "cold_war", "comedy", "disaster", "documentary", "drama", "foreign", "holiday", "horror", "intrigue", "mockumentary", "music", "mystery", "nobbly", "post-apocalypse", "science_fiction", "vietnam_war", "world_war_2"



