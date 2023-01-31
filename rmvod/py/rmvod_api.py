#!/usr/bin/python3

import argparse

from flask import Flask
from flask import request

app = Flask(__name__)

import pymysql
import copy
import json
import uuid
import base64
import os
import yaml
import requests


# vod_api.py  Copyright 2022, 2023 Paul Tourville

# This file is part of RIBBBITmedia VideoOnDemand (a.k.a. "rmvod").

# RIBBBITmedia VideoOnDemand (a.k.a. "rmvod") is free software: you 
# can redistribute it and/or modify it under the terms of the GNU \
# General Public License as published by the Free Software Foundation, 
# either version 3 of the License, or (at your option) any later 
# version.

# RIBBBITmedia VideoOnDemand (a.k.a. "rmvod") is distributed in the 
# hope that it will be useful, but WITHOUT ANY WARRANTY; without even 
# the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR 
# PURPOSE. See the GNU General Public License for more details.

# You should have received a copy of the GNU General Public License 
# along with RIBBBITmedia VideoOnDemand (a.k.a. "rmvod"). If not, 
# see <https://www.gnu.org/licenses/>.

#fileStr = "vodLibrarydb.py"
fileStr = "rmvod_api.py"
versionStr = "0.2.6"

# moving to "proper" deployment via WSGI:  https://flask.palletsprojects.com/en/2.0.x/deploying/mod_wsgi/
class VodLibDB:
    def __init__(self):
        self.dbc = {}
        self.dbc['host'] = 'localhost'
        self.dbc['user'] = 'vodlibapi'
        self.dbc['password'] = 'vodlibapipw'
        self.dbc['database'] = 'vodlib'
        
        self.keylists = {}
        self.keylists['artifact'] = ['artifactid','title','majtype','runmins','season','episode','file','filepath','director','writer','primcast','relorg','relyear','eidrid','imdbid','arbmeta']
        #self.keylists['artifact'] = ['artifactid','title','majtype','runmins','season','episode','file','filepath','director','writer','primcast','relorg','relyear','eidrid','imdbid','arbmeta','synopsis']
        # print('VodLibDB - Got through __init__, anyway .... innit?')
        pass
    def _connect(self):
        dbc = pymysql.connect(host=self.dbc['host'],user=self.dbc['user'],password=self.dbc['password'],database=self.dbc['database'])
        return dbc
        pass
    def _stdRead(self,sqlIn):
        data = None
        try:
            assert sqlIn.split(" ")[0].upper() == "SELECT"
            dbc = self._connect()
            cursor = dbc.cursor()
            cursor.execute(sqlIn)
            data = cursor.fetchall()
            dbc.close()
        except:
            print("Poop")
        return data
    def _stdUpdate(self,sqlIn):
        retval = None
        try:
            assert sqlIn.split(" ")[0].upper() == "UPDATE"
            #print(sqlIn)
            dbc = self._connect()
            cursor = dbc.cursor()
            cursor.execute(sqlIn)
            dbc.commit()
            dbc.close()
            pass
        except:
            print("_stdUpdate Poop: " + sqlIn)
            raise Exception("Update failed!")
        return retval
    def _stdInsert(self,sqlIn):
        retval = None
        try:
            assert sqlIn.split(" ")[0].upper() == "INSERT"
            #print(sqlIn)
            dbc = self._connect()
            cursor = dbc.cursor()
            cursor.execute(sqlIn)
            dbc.commit()
            dbc.close()
            pass
        except:
            print("_stdInsert Poop : " + sqlIn)
            #raise Exception("Insert failed!")
        return retval
    def _stdDelete(self,sqlIn):
        retval = None
        try:
            assert sqlIn.split(" ")[0].upper() == "DELETE"
            #print(sqlIn)
            dbc = self._connect()
            cursor = dbc.cursor()
            cursor.execute(sqlIn)
            dbc.commit()
            dbc.close()
            pass
        except:
            print("_stdDelete: Poop")
            #raise Exception("Insert failed!")
        return retval
    def getDBVersion(self):
        return "0.1.0"
    def fetchArtiDeetsFromOmdbapi(self):
        print("vldb.fetchArtiDeetsFromOmdbapi")
        maxRows = 10
        selSql = 'SELECT artifactid, title, majtype, imdbid, arbmeta '
        selSql += 'FROM artifacts '
        selSql += 'WHERE imdbid != "string" AND arbmeta = \'{"string": "string"}\' '
        selSql += 'ORDER BY title LIMIT ' + str(maxRows) + ';'
        rowsTuple = None
        try:
            rowsTuple = self._stdRead(selSql)
        except:
            print("Source list query failed!")
            return False
        pass
        
        for rowTuple in rowsTuple:
            aId = rowTuple[0]
            aTitle = rowTuple[1]
            aMajtype = rowTuple[2]
            aImdbid = rowTuple[3]
            aArbmeta = rowTuple[4]
            
            api_url = "http://www.omdbapi.com/?i=" + aImdbid + "&apikey=87edb0eb"
            response = requests.get(api_url)
            try:
                jsonStr = json.dumps(response.json()).replace("'","\\\'")
            except:
                print("json.dumps failed for " + aImdbid + ".  Skipping")
                continue
            pass
            
            updSql = "UPDATE artifacts SET arbmeta = '" + jsonStr + "' WHERE artifactid = '" + aId + "'"
            if True == True:
                try:
                    self._stdUpdate(updSql)
                except:
                    print("Update failed for " + aTitle + " (" + aId + ")")
                pass
            else:
                print(api_url +  " -- " + jsonStr)
            pass
        pass
        return True
    def createArtifact(self,artiDictIn):
        retval = None
        
        artiProto = {}
        artiProto['artifactid'] = 'string'
        artiProto['title'] = 'string'
        artiProto['majtype'] = 'string'
        artiProto['runmins'] = -1
        artiProto['season'] = -1
        artiProto['episode'] = -1
        artiProto['file'] = 'string'
        artiProto['filepath'] = 'string'
        artiProto['director'] = ['string']
        artiProto['writer'] = ['string']
        artiProto['primcast'] = ['string']
        artiProto['relorg'] = ['string'] 
        artiProto['relyear'] = -1
        artiProto['eidrid'] = 'string'
        artiProto['imdbid'] = 'string'
        artiProto['arbmeta'] = {'string':'string'}
        
        # Prototype artifact keys list
        apKeys = list(artiProto.keys())
        
        # "new" artifact keys list
        naKeys = list(artiDictIn.keys())
        
        try:
            assert type(artiDictIn) == type({'this':'that'})
            print("Dict OK")
            assert type(artiDictIn['artifactid']) == type("string")
            print("ID Type OK")
            print(len(artiDictIn['artifactid']))
            assert 32 < len(artiDictIn['artifactid']) < 40
            print("ID Length OK")
            assert type(artiDictIn['title']) == type("string")
            print("Title Type OK")
            assert 1 < len(artiDictIn['title']) < 200
            print("Title Length OK")
        except:
            print("createArtifact - Basic dictionary validation failed on '" + str(artiDictIn) + "'")
            return False
        pass
        
        
        sqlSetStr = ""
        sqlInsSetStr = ""
        
        # Preload the artifact ID so the insert will have it.
        artiProto['artifactid'] = artiDictIn['artifactid']
        
        for key in apKeys:
            valTyp = type(artiProto[key])
            if valTyp == type("string"):
                sqlInsSetStr += key + ' = ' + "'" + artiProto[key] + "'"
            elif valTyp == type(-1):
                sqlInsSetStr += key + ' = ' + str(artiProto[key])
            elif valTyp == type(3.14):
                sqlInsSetStr += key + ' = ' + str(artiProto[key])
            elif valTyp == type(['string']):
                sqlInsSetStr += key + ' = ' +  "'" + json.dumps(artiProto[key]) + "'"
            elif valTyp == type({'string':'string'}):
                sqlInsSetStr += key + ' = ' +  "'" + json.dumps(artiProto[key]) + "'"
            else:
                raise Exception("Illegal Value Type in artiProto")
            pass
                
            #sqlInsSetStr += key + ' = ' + artiProto[key]
            if key in naKeys:
                # validate new value
                if type(artiDictIn[key]) == type(artiProto[key]):
                    artiProto[key] = artiDictIn[key]
                else:
                    pass
                pass
            pass
            # sqlSetStr += key + ' = ' + artiProto[key]
            
            valTyp = type(artiProto[key])
            if valTyp == type("string"):
                sqlSetStr += key + ' = ' + artiProto[key]
            elif valTyp == type(-1):
                sqlSetStr += key + ' = ' + str(artiProto[key])
            elif valTyp == type(3.14):
                sqlSetStr += key + ' = ' + str(artiProto[key])
            elif valTyp == type(['string']):
                sqlSetStr += key + ' = ' + json.dumps(artiProto[key])
            elif valTyp == type({'string':'string'}):
                sqlSetStr += key + ' = ' + json.dumps(artiProto[key])
            else:
                raise Exception("Illegal Value Type in artiProto 2: Electric Boogaloo!")
            pass
            
            
            if apKeys.index(key) < (len(apKeys) - 1):
                sqlSetStr += ", "
                sqlInsSetStr += ", "
            else:
                sqlSetStr += " "
                sqlInsSetStr += " "
            pass
        pass
        
        insertSql = "INSERT INTO artifacts SET " + sqlInsSetStr + ";"
        print ("VodLibDB.createArtifact: " + insertSql)
        try:
            self._stdInsert(insertSql)
        except:
            raise Exception("New Artifact Insert failed")
            return False
        pass
        
        try:
            self.updateArtifactByIdAndDict(artiDictIn['artifactid'],artiProto)
            retval = True
        except:
            raise Exception("New Artifact Update failed")
            return False
        pass
        
        return retval
    def createPerson(self,persNameIn):
        retval = None
        # Confirm the Person exists in the 'persons' table
        persCheckSql = 'SELECT personname FROM persons WHERE personname = "' + persNameIn + '"'
        # print(persCheckSql)
        resTuple = self._stdRead(persCheckSql)
        # print(str(resTuple))
        # If not there, add it
        if (type(resTuple) == type(None)) or (len(resTuple) == 0):
            # It's not there
            persAddSql = 'INSERT INTO persons  SET personname = "' + persNameIn + '"'
            self._stdInsert(persAddSql)
        pass
        return retval
    def createCompany(self,compNameIn):
        retval = None
        # Confirm the Company exists in the 'companies' table
        compCheckSql = 'SELECT companyname FROM companies WHERE companyname = "' + compNameIn + '"'
        resTuple = self._stdRead(compCheckSql)
        # If not there, add it
        if (type(resTuple) == type(None)) or (len(resTuple) == 0):
            # It's not there
            compAddSql = 'INSERT INTO companies  SET companyname = "' + compNameIn + '"'
            self._stdInsert(compAddSql)
        return retval
    def createTag(self,tagNameIn):
        retval = None
        tagAddSql = 'INSERT INTO tags  SET tag = "' + tagNameIn + '"'
        retval = self._stdInsert(tagAddSql)
        return retval
    def createArtiText(self,artiIdIn,fieldNmIn,contentIn):
        insSql = "INSERT INTO artitexts SET artifactid = '" + artiIdIn 
        insSql += "', artifield = '" + fieldNmIn 
        insSql += "', artitext = '" + contentIn + "'"
        retval = self._stdInsert(insSql)
        return retval
    def getArtifactTagsById(self,artiIdIn):
        retList = [];
        tagSql = "SELECT tag FROM t2a WHERE artifactid = '" + artiIdIn + "'"
        resTuple = self._stdRead(tagSql)
        for res in resTuple:
            retList.append(res[0])
        return retList
    def getArtifactSubListsById(self,artiIdIn):
        retDict = {'director':[],'writer':[],'primcast':[],'relorg':[]}
        personSql = "SELECT personname, artifactid, artifield FROM p2a WHERE artifactid = '" + artiIdIn + "'"
        companySql = "SELECT companyname, artifactid, artifield FROM c2a WHERE artifactid = '" + artiIdIn + "'"
        personResult = self._stdRead(personSql)
        companyResult = self._stdRead(companySql)
        for person in personResult:
            name = person[0]
            field = person[2]
            retDict[field].append(name)
        for company in companyResult:
            name = company[0]
            field = company[2]
            retDict[field].append(name)
        return retDict
    def getArtifactById(self,artiIdIn,listJsonFlagIn=False):
        keyList = self.keylists['artifact']
        sqlStr = "SELECT " 
        fListStr = ""
        for key in keyList:
            fListStr += key + ", "
        sqlStr += fListStr[0:-2]
        sqlStr += " FROM artifacts WHERE artifactid = '" + artiIdIn + "'"
        
        baseTuple = self._stdRead(sqlStr)
        retList = []
        for record in baseTuple:
            # Get the core of the record
            retDict = {}
            for key in keyList:
                keyIdx = keyList.index(key)
                retDict[key] = record[keyIdx]
            pass
            # Get the "list elements"
            listFieldDict = self.getArtifactSubListsById(artiIdIn)
            lfdKeys = list(listFieldDict.keys())
            for lfdKey in lfdKeys:
                if listJsonFlagIn == False:
                    retDict[lfdKey] = listFieldDict[lfdKey]
                else:
                    retDict[lfdKey] = json.dumps(listFieldDict[lfdKey])
                pass
            pass
            # Get the tags
            tagList = self.getArtifactTagsById(artiIdIn)
            if listJsonFlagIn == False:
                retDict['tags'] = tagList
            else:
                retDict['tags'] = json.dumps(tagList)
            pass
            
            textsSql = 'SELECT artifield, artitext FROM artitexts WHERE artifactid = "'
            textsSql += artiIdIn
            textsSql += '"'
            rowsTuple = self._stdRead(textsSql)
            for rowTuple in rowsTuple:
                retDict[rowTuple[0]] = rowTuple[1]
            
            retList.append(retDict)
        pass
        return retList
    def getArtifactListByTagList(self,tagListIn):
        retval = None
        assert type(tagListIn) == type(['thing'])
        if len(tagListIn) > 0:
            fetchSql = "SELECT t.artifactid, a.title, a.majtype "
            fetchSql += "FROM t2a  t "
            fetchSql += "JOIN artifacts  a ON a.artifactid = t.artifactid "
            tagListStr = ''
            tliLen = len(tagListIn)
            for tag in tagListIn:
                tagListStr += "'" + tag + "'"
                if tagListIn.index(tag) < (tliLen - 1):
                    tagListStr += ', '
                else:
                    tagListStr += ' '
                pass
            pass
            
            fetchSql += "WHERE t.tag IN (" + tagListStr + ")"
        else:
            fetchSql = "SELECT a.artifactid, a.title, a.majtype "
            fetchSql += "FROM artifacts  a "
        pass
        
        fetchSql += "ORDER BY a.title"
        
        listTuple = self._stdRead(fetchSql)
        
        retList = []
        for itemTuple in listTuple:
            tmpDict = {}
            tmpDict['artifactid'] = itemTuple[0]
            tmpDict['title'] = itemTuple[1]
            tmpDict['majtype'] = itemTuple[2]
            retList.append(tmpDict)
        
        return retList
    def getArtifactListByMajtype(self,majtypeStrIn):
        # print("getArtifactListByMajtype - majtypeStrIn: " + majtypeStrIn)
        assert type(majtypeStrIn) == type('thing')
        if len(majtypeStrIn) > 0:
            fetchSql = '';
            fetchSql += "SELECT artifactid, title, majtype "
            fetchSql += "FROM artifacts "
            fetchSql += "WHERE majtype = '" + majtypeStrIn + "' "
        else:
            fetchSql = "SELECT artifactid, title, majtype "
            fetchSql += "FROM artifacts  "
        pass
        fetchSql += "ORDER BY title"
        # print("getArtifactListByMajtype - fetchSql: " + fetchSql)
        listTuple = self._stdRead(fetchSql)
        retList = []
        for itemTuple in listTuple:
            tmpDict = {}
            tmpDict['artifactid'] = itemTuple[0]
            tmpDict['title'] = itemTuple[1]
            tmpDict['majtype'] = itemTuple[2]
            retList.append(tmpDict)
        pass
        return retList
    def getArtifactListByIdList(self,artiIdListIn):
        # print("getArtifactListByMajtype - majtypeStrIn: " + majtypeStrIn)
        assert type(artiIdListIn) == type(['thing'])
        if len(artiIdListIn) > 0:
            fetchSql = '';
            fetchSql += "SELECT artifactid, title, majtype "
            fetchSql += "FROM artifacts "
            fetchSql += "WHERE artifactid in ("
            i = 0
            for artiId in artiIdListIn:
                fetchSql += "'" + artiId + "'"
                if (i < (len(artiIdListIn) - 1 )):
                    fetchSql += ','
                pass
                i += 1
            fetchSql += ') ' 
        else:
            fetchSql = "SELECT artifactid, title, majtype "
            fetchSql += "FROM artifacts  "
        pass
        fetchSql += "ORDER BY title"
        # print("getArtifactListByMajtype - fetchSql: " + fetchSql)
        listTuple = self._stdRead(fetchSql)
        retList = []
        for itemTuple in listTuple:
            tmpDict = {}
            tmpDict['artifactid'] = itemTuple[0]
            tmpDict['title'] = itemTuple[1]
            tmpDict['majtype'] = itemTuple[2]
            retList.append(tmpDict)
        pass
        return retList
    def getArtifactListByArbWhereClause(self,whereClauseStrIn):
        assert type(whereClauseStrIn) == type('thing')
        if len(whereClauseStrIn) > 0:
            fetchSql = '';
            fetchSql += "SELECT artifactid, title, majtype "
            fetchSql += " FROM artifacts "
            fetchSql += " WHERE " + whereClauseStrIn + " "
        else:
            fetchSql = "SELECT artifactid, title, majtype "
            fetchSql += "FROM artifacts  "
        pass
        fetchSql += " ORDER BY title"
        print("getArtifactListByArbWhereClause - fetchSql: " + fetchSql)
        listTuple = self._stdRead(fetchSql)
        retList = []
        for itemTuple in listTuple:
            tmpDict = {}
            tmpDict['artifactid'] = itemTuple[0]
            tmpDict['title'] = itemTuple[1]
            tmpDict['majtype'] = itemTuple[2]
            retList.append(tmpDict)
        pass
        return retList
    def getArtifactListByRelyear(self,relyear1In, relyear2In):
        fetchSql = "SELECT artifactid, title, majtype "
        fetchSql += "FROM artifacts  "
        fetchSql += "ORDER BY title"
        try:
            if (int(relyear1In) > 1900) and  (int(relyear2In) > 1900) and (int(relyear2In) > int(relyear1In)): 
                # We're working with both years
                pass
                fetchSql = "SELECT artifactid, title, majtype "
                fetchSql += " FROM artifacts  "
                fetchSql += " WHERE relyear >= " + str(relyear1In) + " AND relyear <= " + str(relyear2In) + " "
                fetchSql += " ORDER BY title"
            elif (int(relyear2In) > 1900):
                # We're just doing one year, so we're counting on relyear2In
                pass
                fetchSql = "SELECT artifactid, title, majtype "
                fetchSql += " FROM artifacts  "
                fetchSql += " WHERE relyear = " + str(relyear2In) + " "
                fetchSql += " ORDER BY title"
            else: 
                raise Exception("getArtifactListByRelyear - Unable to interpret dates")
            pass
        except:
            print ("getArtifactListByRelyear - Something is broken with the year values provided: " + str(relyear1In) + " and " + str(relyear2In) + ".")
            pass
        pass
        listTuple = self._stdRead(fetchSql)
        retList = []
        for itemTuple in listTuple:
            tmpDict = {}
            tmpDict['artifactid'] = itemTuple[0]
            tmpDict['title'] = itemTuple[1]
            tmpDict['majtype'] = itemTuple[2]
            retList.append(tmpDict)
        pass
        return retList
    def getArtifactListByTitleFrag(self,titleFragIn):
        retval = None
        assert type(titleFragIn) == type("string")
        fetchSql = "SELECT a.artifactid, a.title, a.majtype "
        fetchSql += "FROM artifacts  a "
        fetchSql += "WHERE a.title LIKE '%" + titleFragIn + "%'"
        fetchSql += "ORDER BY a.title"
        listTuple = self._stdRead(fetchSql)
        
        retList = []
        for itemTuple in listTuple:
            tmpDict = {}
            tmpDict['artifactid'] = itemTuple[0]
            tmpDict['title'] = itemTuple[1]
            tmpDict['majtype'] = itemTuple[2]
            retList.append(tmpDict)
        pass
        return retList
    def getArtifactListByPersTitleStr(self,titleFragIn):  ####  NEW NEW NEW  
        retval = None
        
        wrkTitleFrag = str(titleFragIn)
        print('getArtifactListByPersTitleStr.wrkTitleFrag: ' + wrkTitleFrag)
        #assert type(titleFragIn) == type("string")
        
        
        fetchSql = 'SELECT p.artifactid AS "artifactid", a.title AS "title", a.majtype AS "majtype" ' 
        fetchSql += 'FROM p2a p ' 
        fetchSql += 'JOIN artifacts a ON p.artifactid = a.artifactid '
        fetchSql += 'WHERE p.personname LIKE "%' + wrkTitleFrag + '%" '
        
        fetchSql += 'UNION '
        
        fetchSql += 'SELECT a.artifactid AS "artifactid" , a.title AS "title", a.majtype AS "majtype" '  
        fetchSql += 'FROM artifacts a '
        fetchSql += 'WHERE a.title LIKE "%' + wrkTitleFrag + '%" '
        
        fetchSql += 'ORDER BY 2'
            
        print(fetchSql)
        
        
        # fetchSql = "SELECT a.artifactid, a.title, a.majtype "
        # fetchSql += "FROM artifacts  a "
        # fetchSql += "WHERE a.title LIKE '%" + titleFragIn + "%'"
        # fetchSql += "ORDER BY a.title"
        listTuple = self._stdRead(fetchSql)
        
        retList = []
        for itemTuple in listTuple:
            tmpDict = {}
            tmpDict['artifactid'] = itemTuple[0]
            tmpDict['title'] = itemTuple[1]
            tmpDict['majtype'] = itemTuple[2]
            retList.append(tmpDict)
        pass
        return retList
    def getEpisodeListBySeriesId(self,sEpiIdIn):
        fetchSql = "SELECT episodeaid FROM s2e WHERE seriesaid = '" + sEpiIdIn + "'";
        resTuple = self._stdRead(fetchSql)
        resList = [];
        for itemTuple in resTuple:
            resList.append(itemTuple[0])
        pass
        return resList
    def getNextEpisodeArtifact(self,sEpiIdIn):
        retDict = {}
        selSql = "SELECT DISTINCT a.artifactid "
        selSql += "FROM artifacts a "
        selSql += "JOIN s2e s ON a.artifactid = s.episodeaid "
        selSql += "WHERE s.seriesaid = (select seriesaid from s2e where episodeaid = '"
        selSql += sEpiIdIn
        selSql += "' LIMIT 1) " #a7470c75-0514-40ad-8c37-821eda8ccd92')
        selSql += "ORDER BY a.title;"  
        #print('getNextEpisodeArtifact - selSql: ' + selSql)  
        rowsTuple = self._stdRead(selSql)
        idList = []
        for rowTuple in rowsTuple:
            idList.append(rowTuple[0])
        pass
        lastEpIdx = idList.index(sEpiIdIn)
        retList = []
        # if lastEpIdx < (len(idList) - 2) :
        if lastEpIdx < (len(idList) - 1) :
            nextEpId = idList[lastEpIdx + 1]
            retList = self.getArtifactById(nextEpId,False)
        pass
        #print(json.dumps(retList))
        return retList
    def getEpisodeTIMListBySeriesId(self,sEpiIdIn):
        # epiArtiIdList = self.getEpisodeListBySeriesId(sEpiIdIn)
        # if len(epiArtiIdList) == 0:
            # print('getEpisodeTIMListBySeriesId: getEpisodeListBySeriesId(' + sEpiIdIn + ') returned no rows')
            # return []
        # pass
        fetchSql = "SELECT a.artifactid, a.title, a.majtype "
        fetchSql += " FROM artifacts  a "
        fetchSql += " WHERE a.artifactid IN ("
        fetchSql += " SELECT episodeaid FROM s2e WHERE seriesaid = '" + sEpiIdIn + "') " 
        # for artiId in epiArtiIdList:
            # #print(artiId)
            # fetchSql += "'" + artiId + "'"
            # if (epiArtiIdList.index(artiId)) < (len(epiArtiIdList) -1 ):
                # fetchSql += ", "
            # else: 
                # fetchSql += ') '
            # pass
        
        try:
            fetchSql += "ORDER BY a.title"
        
            resTuple = self._stdRead(fetchSql)
            retList = []
            for itemTuple in resTuple:
                tmpDict = {}
                tmpDict['artifactid'] = itemTuple[0]
                tmpDict['title'] = itemTuple[1]
                tmpDict['majtype'] = itemTuple[2]
                retList.append(tmpDict)
            pass
        except:
            print("getEpisodeTIMListBySeriesId - Secondary query failed!")
            print("getEpisodeTIMListBySeriesId - epiArtiIdList: " + str(len(epiArtiIdList)))
            print ("getEpisodeTIMListBySeriesId - fetchSql: \n" + fetchSql)
        pass
        return retList
    def getTagList(self):
        retval = None
        try:
            tagSQL = "SELECT tag FROM tags ORDER BY tag"
            rowsTuple = self._stdRead(tagSQL)
            tagList = []
            for row in rowsTuple:
                tagList.append(row[0])
            retval = tagList
        except:
            print("getTagList - POOP")
        return retval
    def getSupportList(self,tableNameIn):
        retval = None
        slSql = ''
        if tableNameIn == 'persons':
            slSql = 'SELECT personname FROM persons ORDER BY personname'
        elif tableNameIn == 'companies':
            slSql = 'SELECT companyname FROM companies ORDER BY companyname'
        elif tableNameIn == 'tags':
            slSql = 'SELECT tag FROM tags ORDER BY tag'
        else:
            print (str(tableNameIn) + ' is invalid')
            return retval
            
        try:
            # tagSQL = "SELECT tag FROM tags ORDER BY tag"
            rowsTuple = self._stdRead(slSql)
            itemList = []
            for row in rowsTuple:
                itemList.append(row[0])
            retval = itemList
        except:
            print("getSupportList - POOP")
        return retval
    def findTag(self,tagNmIn):
        retval = None
        sqlStr = "SELECT tag FROM tags WHERE tag LIKE '%" + tagNmIn + "%'"
        resTuple = self._stdRead(sqlStr)
        resList = []
        for row in resTuple:
            resList.append(row[0])
        pass
        retval = resList
        return retval
    def addTagtoArtifact(self,tagStrIn,artiIdIn):
        retval = None
        self.createTag(tagStrIn)
        tagSql = "INSERT INTO t2a SET tag = '" + tagStrIn + "', artifactid = '" + artiIdIn + "'"
        self._stdInsert(tagSql)
        return retval
    def updateJoinTable(self,artiIdin,keyIn,tableIn,valListIn):
        # We're going to simplify this... Clear out the values for thi
        # table, artifactid, and fieldname, then insert the ones 
        # provided.  This is taking a more declarative approach.  The 
        # expectation is that the full current list will be provided for 
        # all updates.  This COULD be tedious or ropy for very long lists
        # but most movies have fairly constrained director, writer, and 
        # distribution company lists.  Their primary casts are usually 
        # not that big either.  We'll take the hit on big lists.
        
        # updateJoinTable: c539d5b6-316e-4c61-93d6-29613d15ef5d, tags, t2a, ['horror', 'science_fiction', 'thriller', 'world_war_2']
        # 127.0.0.1 - - [11/Oct/2022 13:34:30] "POST /artifact/update HTTP/1.1" 200 -
        
        
        #print('updateJoinTable: ' + artiIdin + ', ' + keyIn + ', ' + tableIn + ', ' + str(valListIn))
        
        retval = None
        if tableIn == 'p2a':
            p2aPreClearSql = 'DELETE FROM p2a WHERE artifactid = "'
            p2aPreClearSql += artiIdin
            p2aPreClearSql += '" AND artifield = "'
            p2aPreClearSql += keyIn
            p2aPreClearSql += '"'
            # print('p2aPreClearSql: ' + p2aPreClearSql)
            self._stdDelete(p2aPreClearSql)
            for val in valListIn:
                # print('Trying to create Person ' + val)
                self.createPerson(val)
                # print('Trying to insert into p2a...')
                p2aInsSql = 'INSERT INTO p2a SET personname = "'
                p2aInsSql += val
                p2aInsSql += '", artifactid = "'
                p2aInsSql += artiIdin
                p2aInsSql += '", artifield = "'
                p2aInsSql += keyIn
                p2aInsSql += '"'
                # print('p2aInsSql: ' + p2aInsSql)
                self._stdInsert(p2aInsSql)
                # print('...done.')
                pass
            pass
        elif tableIn == 'c2a':
            c2aPreClearSql = 'DELETE FROM c2a WHERE artifactid = "'
            c2aPreClearSql += artiIdin
            c2aPreClearSql += '" AND artifield = "'
            c2aPreClearSql += keyIn
            c2aPreClearSql += '"'
            # print(c2aPreClearSql)
            self._stdDelete(c2aPreClearSql)
            for val in valListIn:
                self.createCompany(val)
                
                c2aInsSql = 'INSERT INTO c2a SET companyname = "'
                c2aInsSql += val
                c2aInsSql += '", artifactid = "'
                c2aInsSql += artiIdin
                c2aInsSql += '", artifield = "'
                c2aInsSql += keyIn
                c2aInsSql += '"'
                self._stdInsert(c2aInsSql)
                pass
            pass
        elif tableIn == 't2a':
            t2aPreClearSql = 'DELETE FROM t2a WHERE artifactid = "'
            t2aPreClearSql += artiIdin
            #t2aPreClearSql += '" AND artifield = "'
            #t2aPreClearSql += keyIn
            t2aPreClearSql += '"'
            # print(c2aPreClearSql)
            self._stdDelete(t2aPreClearSql)
            for val in valListIn:
                self.createTag(val)
                
                t2aInsSql = 'INSERT INTO t2a SET tag = "'
                t2aInsSql += val
                t2aInsSql += '", artifactid = "'
                t2aInsSql += artiIdin
                #t2aInsSql += '", artifield = "'
                #t2aInsSql += keyIn
                t2aInsSql += '"'
                self._stdInsert(t2aInsSql)
                pass
            pass
        elif tableIn == 'artitexts':
            
            # MariaDB [vodlib]> desc artitexts;
            # +------------+-------------+------+-----+---------+-------+
            # | Field      | Type        | Null | Key | Default | Extra |
            # +------------+-------------+------+-----+---------+-------+
            # | artifactid | varchar(40) | NO   | PRI | NULL    |       |
            # | artifield  | varchar(50) | NO   | PRI | NULL    |       |
            # | artitext   | mediumtext  | NO   |     | NULL    |       |
            # +------------+-------------+------+-----+---------+-------+
            # 3 rows in set (0.001 sec)
            
            # INSERT INTO ins_duplicate VALUES (4,'Gorilla') 
            # ON DUPLICATE KEY UPDATE animal='Gorilla';
            
            atUpdateSql = 'INSERT INTO artitexts VALUES ("'
            atUpdateSql += artiIdin
            atUpdateSql += '","'
            atUpdateSql += keyIn
            atUpdateSql += '","'
            atUpdateSql += valListIn[0]
            atUpdateSql += '") ON DUPLICATE KEY UPDATE artitext = "'
            atUpdateSql += valListIn[0]
            atUpdateSql += '"'
            # print('updateJoinTable: ' + atUpdateSql)
            self._stdInsert(atUpdateSql)
        else:
            print('updateJoinTable - Unknown table type: ' + tableIn)
        #woof
        pass
        return retval
    def updateArtifactByIdAndDict(self,artiIdIn,updateDictIn):
        
        # print('updateArtifactByIdAndDict: ' + artiIdIn + ', ' + json.dumps(updateDictIn))
        
        # keyList is the reference key list from "self"
        keyList = self.keylists['artifact']
        # workingUD is the "working" Update Dictionary
        workingUD = {}
        # workingTagsList should be obvious
        workingTagsList = []
        
        # diKeys is the list of keys in updateDictIn
        # Among other things, we will use this to identifiy
        # fields which are handled outside the "artifacts" table 
        diKeys = list(updateDictIn.keys())
        
        #  We're building up workingUD to include only those KVPs
        # represented in keyList 
        for rKey in keyList:
            if rKey in diKeys:
                workingUD[rKey] = updateDictIn[rKey]
            pass
        pass
        
        # print('updateArtifactByIdAndDict: WOOFWOOF 001 - workingUD: ' + str(workingUD))
        
        
        
        # Put tags (if any) in workingTagsList for separate handling
        if "tags" in diKeys:
            for udiTag in updateDictIn['tags']:
                workingTagsList.append(udiTag)
            pass
        pass
        
        
        
        # print('updateArtifactByIdAndDict: WOOFWOOF 002 - workingTagsList: ' + str(workingTagsList))
        
        # Set up join table references
        joinTableFieldList = ['director','writer','primcast','relorg','synopsis','tags']
        joinTableLUDict = {'director':'p2a','writer':'p2a','primcast':'p2a','relorg':'c2a','synopsis':'artitexts','tags':'t2a'}
        
        # Start setting up the UPDATE SQL for the artifacts table
        #workingArtiSql = "UPDATE artifacts SET "
        workingArtiSql = ""
        
        # get the list of keys from the workingUD dictionary, since
        # we should be done populating it now
        # "Working Artifact Key List"
        # wakList = list(workingUD.keys())
        wakList = list(updateDictIn.keys())
        
        # print('updateArtifactByIdAndDict: WOOFWOOF 003 - wakList: ' + str(wakList))
        
        #  Now, let's build up the daWKList - this is the keys for 
        # fields we will actually be updating natively in the artifact.
        daWAKList = []
        for key in wakList:
            if key not in joinTableFieldList:
                # print('Adding ' + key + ' to daWAKList')
                daWAKList.append(key)
            pass
        pass
        
        # print('updateArtifactByIdAndDict: WOOFWOOF 004 - ' + str(daWAKList))
        
        # Process the artifact fields
        if len(daWAKList) > 0:
            # print('going to try to build up workingArtiSql')
            # Start setting up the UPDATE SQL for the artifacts table
            workingArtiSql = "UPDATE artifacts SET "
            for daWKey in daWAKList:
                # print('Working daWKey: ' + daWKey)
                wakVal = workingUD[daWKey]
                # print('wakVal: ' + str(wakVal))
                workingArtiSql += daWKey + ' = ' 
                # print('workingArtiSql: ' + workingArtiSql)
                wakValTyp = type(wakVal)
                # print('wakValTyp: ' + str(wakValTyp))
                
                # Handle different value types
                if wakValTyp == type('string'):
                    # print(daWKey + ' STRING!')
                    # workingArtiSql += "'" + wakVal + "'"
                    workingArtiSql += "'" + wakVal.replace("'","\\\'") + "'"
                elif wakValTyp == type(-1):
                    # print(daWKey + ' INTEGER!')
                    workingArtiSql +=  str(wakVal) 
                elif wakValTyp == type(3.14):
                    # print(daWKey + ' FLOAT!')
                    workingArtiSql +=  str(wakVal) 
                elif wakValTyp == type(['poop']):
                    # print(daWKey + ' LIST!')
                    # Actually, all the lists have been farmed out to 
                    # joining tables, so... this needs to be more complex
                    workingArtiSql +=  "'" + json.dumps(wakVal) + "'"
                elif wakValTyp == type({'poop':'poop'}):
                    # print(daWKey + ' DICTIONARY!')
                    workingArtiSql +=  "'" + json.dumps(wakVal) + "'" 
                else:
                    print(daWKey + ' UNKNOWN! WTF?!')
                    raise Exception ('UNHANDLED TYPE')
                pass
                if daWAKList.index(daWKey) < (len(daWAKList) - 1):
                    # print("Adding a comma.")
                    workingArtiSql += ', '
                pass
            workingArtiSql += " WHERE artifactid = '" + artiIdIn + "'"
            # print('workingArtiSql: ' + workingArtiSql)
            # print('updateArtifactByIdAndDict: WOOFWOOF 005 - workingArtiSql: ' + workingArtiSql)
            self._stdUpdate(workingArtiSql)
        pass
        
        for wak in wakList:
            if wak in joinTableFieldList:
                #This is where we handle "join table keys"
                # print('Handling Join Table key ' + wak)
                newVal = updateDictIn[wak]
                jTable = joinTableLUDict[wak]
                # print('jTable: ' + jTable)
                if jTable == 'artitexts':
                    newVal = [updateDictIn[wak]]
                # print('newVal: ' + str(newVal))
                self.updateJoinTable(artiIdIn,wak,jTable,newVal)
                pass
            pass
        pass
        
        
        # print('updateArtifactByIdAndDict: WOOFWOOF 006')
        
        # workingArtiSql += " WHERE artifactid = '" + artiIdIn + "'"
        # print(workingArtiSql)
        # Update the Artifact
        pass
    def deleteArtifact(self,artiIdIn):
        retval = None
        tblNmList = ['artifacts','c2a','p2a','t2a']
        for tblNm in tblNmList:
            try:
                delArtiSql = "DELETE FROM "
                delArtiSql += tblNm
                delArtiSql += " WHERE artifactid = '"
                delArtiSql += artiIdIn
                delArtiSql += "'"
                self._stdDelete(delArtiSql)
            except:
                print("Delete of " + artiIdIn + " from " + tblNm + " FAILED")
                retval = False
            pass
        pass
        if retval == None:
            retval = True
        pass
        return retval
    def removeTagFromArtifact(self,artiIdIn,tagStrIn):
        retval = None
        try:
            pass
            delArtiTagSql = "DELETE FROM "
            delArtiTagSql += "t2a"
            delArtiTagSql += " WHERE artifactid = '"
            delArtiTagSql += artiIdIn
            delArtiTagSql += "' AND tag = '"
            delArtiTagSql += tagStrIn
            delArtiTagSql += "'"
            self._stdDelete(delArtiTagSql)
        except:
            print('POOP! removeTagFromArtifact',artiIdIn,tagStrIn)
            pass
            
        return retval
    def getArtifactNeedingImdbId(self,majtypeIn="movie"):
        selSql = "SELECT title,artifactid "
        selSql += "FROM artifacts "
        selSql += "WHERE imdbid = 'string' AND majtype = '" 
        selSql += majtypeIn
        selSql += "' LIMIT 1"
        
        rowsTuple = self._stdRead(selSql)
        retDict = {}
        if len(rowsTuple) > 0:
            retDict['title'] = rowsTuple[0][0]
            retDict['artifactid'] = rowsTuple[0][1]
        else:
            raise Exception("No result found")
        pass
        return retDict
    def getArtifactCountByFieldValue(self,fieldIn,valueIn):
        count = 0
        selSql = "SELECT COUNT(*) FROM artifacts WHERE "
        selSql += fieldIn
        selSql += " = '"
        selSql += valueIn
        selSql += "'"
        
        rowsTuple = self._stdRead(selSql)
        count = rowsTuple[0][0]
        
        return count
    def setImdbId(self,artiIdIn,imdbIdIn):
        retval = False
        try:
            assert type(artiIdIn) == type('string')
            assert 32 < len(artiIdIn) < 40
            assert type(imdbIdIn) == type('string')  # tt1856101
            assert (imdbIdIn == 'none') or (8 < len(imdbIdIn) < 12)
            
            updSql = "UPDATE artifacts "
            updSql += "SET imdbid = '" + imdbIdIn + "' "
            updSql += "WHERE artifactid = '" + artiIdIn + "'"
            
            self._stdUpdate(updSql)
            
            retval = True
        except:
            print("setImdbId update failed with values: artiIdIn: " + artiIdIn + "; imdbIdIn: " + imdbIdIn )
        return retval
    def assignTagToSeries(self, seriesAIDIn, tagIn):
        retval = False
        
        # Confirm the Series exists (e.g. SELECT title, artifactid FROM artifacts WHERE majtype = 'tvseries' and title LIKE 'Perry Mason%';)
        sql1 = "SELECT COUNT(*) FROM artifacts WHERE majtype = 'tvseries' AND artifactid = '"
        sql1 += seriesAIDIn
        sql1 += "'"
        rowsTuple = self._stdRead(sql1)
        if rowsTuple[0][0] == 0:
            print("Series with ID " + seriesAIDIn + " not found")
            return retval
        pass
        
        # Confirm the Tag exists (e.g. SELECT tag FROM tags WHERE tag = 'detective';)
        sql2 = "SELECT COUNT(*) FROM tags WHERE tag = '"
        sql2 += tagIn
        sql2 += "'"
        rowsTuple = self._stdRead(sql2)
        if rowsTuple[0][0] == 0:
            print("Tag " + tagIn + " not found")
            return retval
        pass
        
        # Get the list of Episodes (e.g. select episodeaid from s2e where seriesaid = '03d66d13-0c0f-463a-af0b-edbb78d6b517';)
        sql3 = "SELECT episodeaid FROM s2e WHERE seriesaid = '"
        sql3 += seriesAIDIn
        sql3 += "'"
        rowsTuple = self._stdRead(sql3)
        epIdList = []
        for rowTuple in rowsTuple:
             epIdList.append(rowTuple[0])
             
        epIdList.append(seriesAIDIn)
        
        # For each Episode in the above result, insert into t2a a 
        for aId in epIdList:
            sql4 = "INSERT INTO t2a SET tag = '"
            sql4 += tagIn
            sql4 += "', artifactid = '"
            sql4 += aId
            sql4 += "'"
            try:
                self._stdInsert(sql4)
            except:
                print("Tag assignment " + tagIn + ", " + aId + " failed.")
            pass
        pass
        
        retval = True
        
        return retval
    def getTVEposidesByPathFileFrag(self,pathIn,fnFragIn):
        retval = []
        # > Get list of "tvepisode" artifacts with the filePath and fnFrag
        sqlStr = "SELECT a.artifactid, a.title, a.file, a.filepath"
        sqlStr += " FROM artifacts a  "
        sqlStr += " WHERE majtype = 'tvepisode' "
        sqlStr += " AND filepath = '" + pathIn + "' "
        sqlStr += " AND file LIKE '%" + fnFragIn + "%' "
        print('\n' + sqlStr + '\n')
        
        resTuple = self._stdRead(sqlStr)
        
        resList = [];
        for itemTuple in resTuple:
            # resList.append(itemTuple[0])
            tmpDict = {}
            tmpDict['artifactid'] = itemTuple[0]
            tmpDict['title'] = itemTuple[1]
            tmpDict['file'] = itemTuple[2]
            tmpDict['filepath'] = itemTuple[3]
            resList.append(tmpDict)
        return resList
    def addEpisodeToSeries(self,serAIDIn,epAIDIn):
        insSql = 'INSERT INTO s2e SET seriesaid = "' + serAIDIn + '", episodeaid = "' + epAIDIn +'"'
        result = self._stdInsert(insSql)
        

class MediaLibraryDB:
    def __init__(self):
        # Metadata for this isntantiation
        self.meta = {}
        
        # Set-up the data store for the whole point of why we're here.
        self.intializeLibDict()
        
        # fun fact about tags -- all tags are stored "smash-case lower"
        # with spaces converted to underscores
        #  See function __normalizeTagStr for all the deets
        self.libMeta = {}
        self.libMeta['libstore'] = {'path':'/home/tourvilp/Desktop/vodlib/DBSCRATCH/data','file':'vml_test.json'}
        self.libMeta['retdicttempl'] = {'method':'','params':[],'status':{},'data':[]}
        self.libMeta['retdicttempl']['status']['success'] = False
        self.libMeta['retdicttempl']['status']['detail'] = ''
        self.libMeta['retdicttempl']['status']['log'] = []
        
        pass
    def __normalizeTagStr(self,tagStrIn):
        istr0 = tagStrIn.lower()
        istr1 = istr0.strip()
        istr2 = istr1.replace(' ','_')
        return istr2
    def getDBVersion(self):
        vldb = VodLibDB()
        return vldb.getDBVersion()
    def artifactFileCheck(self,pathIn,fileIn):
        basePath = '/var/www/html/rmvod/vidsrc/'
        exist = os.path.exists(basePath + pathIn + '/' + fileIn)
        # print("newArtiPreCheck exist " + fileIn, exist)
        return  exist    
    def newArtiPreCheck(self,pathIn,fileIn):
        #print("newArtiPreCheck " + pathIn + ", " +fileIn)
        basePath = '/var/www/html/rmvod/vidsrc/'
        exist = os.path.exists(basePath + pathIn + '/' + fileIn)
        #print("newArtiPreCheck exist " + fileIn, exist)
        
        vldb = VodLibDB()
        count = vldb.getArtifactCountByFieldValue('file',fileIn)
        #print("newArtiPreCheck count " + fileIn, count)
        
        retval = False
        if (exist == True) and (count == 0):
            retval = True
        return retval
    def intializeLibDict(self):
        self.libDict = {}
        self.libDict['n2a'] = {}
        self.libDict['artifacts'] = {}
        self.libDict['tags'] = []
        self.libDict['a2t'] = {}
        self.libDict['t2a'] = {}
        self.libDict['series'] = []
        
        vldb = VodLibDB()
        self.libDict['tags'] = vldb.getTagList()
        
        self.artifactProto = {}
        self.artifactProto['artifactid'] = 'string'
        self.artifactProto['title'] = 'string'
        self.artifactProto['majtype'] = 'string'
        self.artifactProto['runmins'] = -1
        self.artifactProto['season'] = -1
        self.artifactProto['episode'] = -1
        self.artifactProto['file'] = 'string'
        self.artifactProto['filepath'] = 'string'
        self.artifactProto['director'] = ['string']
        self.artifactProto['writer'] = ['string']
        self.artifactProto['primcast'] = ['string']
        self.artifactProto['relorg'] = ['string'] 
        self.artifactProto['relyear'] = -1
        self.artifactProto['eidrid'] = 'string'
        self.artifactProto['imdbid'] = 'string'
        self.artifactProto['arbmeta'] = {'string':'string'}
        
        pass
    def readCssFile(self,cssFilPathIn):
        verNmbrStr = "Undetermined";
        # srchStr = "vodlib.css version"
        srchStr = "rmvod_core.css version"
        # /* vodlib.css version 0.2.1 */
        try:
            fh2 = open(cssFilPathIn,'rt')
            foundIt = False
            while foundIt == False:
                lineStr = fh2.readline()
                if (lineStr == ""):
                    print(srchStr + ' not found in ' + cssFilPathIn)
                    break
                # if ("vodlib.css version" in lineStr):
                if (srchStr in lineStr):
                    foundIt = True
                    partList = lineStr.split(" ")
                    verNmbrStr = partList[3]
                pass
            pass
            fh2.close()
        except IOError as error:
            print('File Sad: ' + str(error))
        else:
            pass
        finally:
            pass
        pass
        return verNmbrStr  
    def readHtmlFile(self,htmlFilPathIn):
         # <!-- vodlib_static_3.html version 
        verNmbrStr = "Undetermined";
        #srchStr = "<!-- vodlib_static_3.html version "
        srchStr = "<!-- rmvod.html version "
        try:
            fh2 = open(htmlFilPathIn,'rt')
            foundIt = False
            while foundIt == False:
                lineStr = fh2.readline()
                if (lineStr == ""):
                    print(srchStr + ' not found in ' + cssFilPathIn)
                    break
                if (srchStr in lineStr):
                    foundIt = True
                    partList = lineStr.split(" ")
                    verNmbrStr = partList[3]
                pass
            pass
            fh2.close()
        except IOError as error:
            print('File Sad: ' + str(error))
        else:
            pass
        finally:
            pass
        pass
        return verNmbrStr
    def loadJsonLibrary(self,jsonStrIn):
        retval = False
        try:
            self.libDict = json.loads(jsonStrIn)
            retval = True
        except:
            print("POOP!  JSON Load FAILED!!!")
        pass
        return retval
    def extractJsonLibrary(self):
        pass
        retDict = {}
        retDict = {'n2a':{},'artifacts':{},'tags':[],'t2a':{},'a2t':{}}
        artiList = self.findArtifactsByName('')
        for artiListDict in artiList:
            artiId = artiListDict['artifactid']
            thisArtiDict = self.getArtifactById(artiId)
            retDict['artifacts'][artiId] = thisArtiDict
            retDict['a2t'] = thisArtiDict['tags']
            retDict['n2a'][thisArtiDict['title']] = artiId
        pass
            
        return json.dumps(retDict)
    def extractJsonLibraryFile(self):
        return json.dumps(self.libDict)
    def loadLibraryFromFile(self,fqFilPathIn=None):
        fqfp = None
        if (fqFilPathIn == None):
            fqfp = self.libMeta['libstore']['path'] + '/' + self.libMeta['libstore']['file']
        else:
            fqfp = fqFilPathIn
        pass
        try:
            fh2 = open(fqfp,'rb')
            b64InBytes = fh2.read()
            fh2.close()
        except IOError as error:
            print('File Sad: ' + str(error))
        else:
            readString = base64.b64decode(b64InBytes)
            self.loadJsonLibrary(readString)
        finally:
            pass
        pass
    def saveLibraryToFile(self,fqFilPathIn=None):
        # WRITE CURRENT BUFFER OUT TO FILE
        masterString = self.extractJsonLibrary()
        b64OutBytes = base64.b64encode(masterString.encode('ascii'))
        fqfp = None
        if (fqFilPathIn == None):
            fqfp = self.libMeta['libstore']['path'] + '/' + self.libMeta['libstore']['file']
        else:
            fqfp = fqFilPathIn
        None
        try:
            fh1 = open(fqfp,'wb')
            fh1.write(b64OutBytes)
            fh1.close()
        except IOError as error:
            print('File Sad: ' + str(error))
        else:
            pass
        finally:
            pass
        pass
    def createTag(self,tagStrIn):
        retval = False
        try:
            ntag = self.__normalizeTagStr(tagStrIn)
            vldb = VodLibDB()
            vldb.createTag(ntag)
            retval = True
        except:
            retval = False
            pass
        pass
        return retval
    def createArtitext(self,artiIdIn,fieldNameIn,contentIn):
        retval = False
        try:
            vldb = VodLibDB()
            vldb.createArtiText(artiIdIn,fieldNameIn,contentIn)
            retval = True
        except:
            retval = False
            pass
        pass
        return retval
    def deleteTag(self,tagStrIn):
        retval = False
        tidx = self.findTag(tagStrIn)
        if (tidx > -1) :
            # Tag is present
            try:
                ntag = self.__normalizeTagStr(tagStrIn)
                del self.libDict['tags'][tidx]
                del self.libDict['t2a'][ntag]
                retval = True
            except:
                retval = False
                pass
            pass
        else:
            # Tag is not present
            retval = True
        pass
        return retval
    def findTag(self,tagStrIn):
        ntag = self.__normalizeTagStr(tagStrIn)
        retval = -1
        try:
            #retval = self.libDict['tags'].index(ntag)
            
            vldb = VodLibDB()
            resTagList = vldb.findTag(ntag)
            retval = len(resTagList)
            
        except:
            retval = -1
        pass
        return retval
    def getSupportList(self,tableNameIn): # UPDATED FOR NEW RETURN OBJECT MODEL
        
        tmpRetObj = copy.deepcopy(self.libMeta['retdicttempl'])
        tmpRetObj['method'] = 'getSupportList'
        tmpRetObj['params'] = [tableNameIn]
        # tmpRetObj['status']['success'] = True        
        
        
        
        retval = None
        try:
            assert tableNameIn in ['persons','companies','tags']
            # ntag = self.__normalizeTagStr(tagStrIn)
            vldb = VodLibDB()
            # retval = vldb.getSupportList(tableNameIn)
            tmpRetObj['data'] = vldb.getSupportList(tableNameIn)
            tmpRetObj['status']['success'] = True 
            # retval = True
        except:
            # retval = False
            pass
            pass
        pass
        return tmpRetObj
    def createArtifact(self,artifactDictIn):
        # We should be confirming that the title doesn't already exist
        try:
            assert (type(artifactDictIn['title']) == type("A String"))
        except:
            raise Exception("createArtifact - FATAL: No Title Provided")
        pass
        aId = str(uuid.uuid4())
        artifactDictIn['artifactid'] = aId
        pKeyList = list(self.artifactProto.keys())
        aKeyList = list(artifactDictIn.keys())
        skipKeysList = []
        inserDict = {}
        for pKey in pKeyList:
            if pKey in aKeyList:
                try:
                    assert (type(self.artifactProto[pKey]) == type(artifactDictIn[pKey]))
                    inserDict[pKey] = artifactDictIn[pKey]
                except:
                    print("createArtifact: POOP " + str(pKey))
                    skipKeysList.append(pKey)
                pass
            else:
                print("createArtifact: MISSING " + str(pKey))
                inserDict[pKey] = artifactDictIn[pKey]
            pass
        pass
        vldb = VodLibDB()
        vldb.createArtifact(inserDict)
        return aId
    def modifyArtifact(self,artifactIdIn,artifactDictIn): # UPDATED FOR NEW RETURN OBJECT MODEL
        #retval = False
        
        tmpRetObj = copy.deepcopy(self.libMeta['retdicttempl'])
        tmpRetObj['method'] = 'modifyArtifact'
        tmpRetObj['params'] = [artifactIdIn, artifactDictIn]
        # tmpRetObj['status']['success'] = True
        
        # artifactDictIn = self.titleLibTweak(artifactDictIn)
        try:
            vldb = VodLibDB()
            foo = vldb.updateArtifactByIdAndDict(artifactIdIn,artifactDictIn)
            # retval = True
            tmpRetObj['status']['success'] = True
        except:
            # retval = False
            print('Artifact update failed')
        pass
        return tmpRetObj
    def artifactListFieldAction(self,paramObjIn): # UPDATED FOR NEW RETURN OBJECT MODEL
        
        tmpRetObj = copy.deepcopy(self.libMeta['retdicttempl'])
        tmpRetObj['method'] = 'artifactListFieldAction'
        tmpRetObj['params'] = [paramObjIn]
        # tmpRetObj['status']['success'] = True
        
        # {"action": "remove-member", "field": "tags", "artifactid": "b013a2e4-a681-4312-bba0-2e476782fe1b", "value": "animation"}
        artiObj = self.getArtifactById(paramObjIn['artifactid'])
        wrkList = artiObj[paramObjIn['field']]
        #retObj = {paramObjIn['field']:wrkList}
        tmpRetObj['data'].append({paramObjIn['field']:wrkList})
        tmpRetObj['status']['log'].append(json.dumps(tmpRetObj['data'][0]))
        if paramObjIn['action'] == 'remove-member':
            try:
                wrkList.remove(paramObjIn['value'])
                self.modifyArtifact(artiObj['artifactid'],{paramObjIn['field']:wrkList})
                #retObj[paramObjIn['field']] = wrkList
                tmpRetObj['data'][0][paramObjIn['field']] = wrkList
                tmpRetObj['status']['success'] = True
            except:
                print('artifactListFieldAction: ' +  paramObjIn['value'] + ' is not a valid ' + paramObjIn['field'])
            pass
        elif paramObjIn['action'] == 'add-member':
            if not (paramObjIn['value'] in wrkList):
                wrkList.append(paramObjIn['value'])
                self.modifyArtifact(artiObj['artifactid'],{paramObjIn['field']:wrkList})
                #retObj[paramObjIn['field']] = wrkList
                tmpRetObj['data'][0][paramObjIn['field']] = wrkList
                tmpRetObj['status']['success'] = True
            else:
                print('artifactListFieldAction: ' +  paramObjIn['value'] + ' is already a member of ' + paramObjIn['field'])
            pass
        elif paramObjIn['action'] == 'add-choice':
            #print('artifactListFieldAction: ' +  "Don't know what to do with add-choice")
            wrkList.append(paramObjIn['value']);
            self.modifyArtifact(artiObj['artifactid'],{paramObjIn['field']:wrkList})
            artiObj2 = self.getArtifactById(paramObjIn['artifactid'])
            #retObj[paramObjIn['field']] = artiObj2[paramObjIn['field']]
            tmpRetObj['data'][0][paramObjIn['field']] = artiObj2[paramObjIn['field']]
            tmpRetObj['status']['success'] = True
            
        else:
            print('artifactListFieldAction: ' +  "Don't know what to do with this: " + paramObjIn['action'])
            print(str(paramObjIn))
        pass
        return tmpRetObj
                
        pass
    def modifyArtifactTitle(self,oldTitleIn,newTitleIn,artifactIdIn):
        retval = False
        try:
            self.modifyArtifact(artifactIdIn,{'title':newTitleIn})
            retval = True
        except:
            print('Title Update failed')
        return retval
    def deleteArtifact(self,artifactId=None,artifactName=None):
        retval = False
        vldb = VodLibDB()
        retval = vldb.deleteArtifact()
        return retval
    def getTagList(self):
        retval = None
        vldb = VodLibDB()
        retval = vldb.getTagList()
        return retval
    def getArtifactByIdNew(self,artiIdIn): # UPDATED FOR NEW RETURN OBJECT MODEL
        retval = None
        
        tmpRetObj = copy.deepcopy(self.libMeta['retdicttempl'])
        tmpRetObj['method'] = 'getArtifactByIdNew'
        tmpRetObj['params'] = [artiIdIn]
        tmpRetObj['status']['success'] = True
                
        try:
            vldb = VodLibDB()
            retval = vldb.getArtifactById(artiIdIn,False)[0]
            retval = self.titleLibTweak(retval)
            #tmpRetObj['data'] = [retval]
            tmpRetObj['data'].append(retval)
        except:
            tmpRetObj['status']['success'] = False
            tmpRetObj['status']['detail'] = "getArtifactById for " + artiIdIn + " FAILED"
            print("getArtifactById for " + artiIdIn + " FAILED")
        pass
        try:
            #retval['poster'] = self.fetchPosterFile(retval['imdbid'])
            tmpRetObj['data'][0]['poster'] = self.fetchPosterFile(retval['imdbid'])
        except:
            print("getArtifactById couldn't get the poster file.  Sad.")
            
        
        return tmpRetObj
    def getArtifactById(self,artiIdIn):
        retval = None
        try:
            vldb = VodLibDB()
            retval = vldb.getArtifactById(artiIdIn,False)[0]
            retval = self.titleLibTweak(retval)
        except:
            print("getArtifactById for " + artiIdIn + " FAILED")
        pass
        try:
            retval['poster'] = self.fetchPosterFile(retval['imdbid'])
        except:
            print("getArtifactById couldn't get the poster file.  Sad.")
        return retval
    def getNextEpisodeArtifactById(self,artiIdIn): # UPDATED FOR NEW RETURN OBJECT MODEL
        
        tmpRetObj = copy.deepcopy(self.libMeta['retdicttempl'])
        tmpRetObj['method'] = 'getNextEpisodeArtifactById'
        tmpRetObj['params'] = [artiIdIn]
        tmpRetObj['status']['success'] = True
                
        retval = None
        try:
            vldb = VodLibDB()
            #retval = vldb.getNextEpisodeArtifact(artiIdIn)[0]
            tmpres = vldb.getNextEpisodeArtifact(artiIdIn)[0]
            #print(json.dumps(tmpres))
            tmpRetObj['data'] = vldb.getNextEpisodeArtifact(artiIdIn)
            #print(json.dumps(tmpRetObj))
        except:
            print("getNextEpisodeArtifactById for " + artiIdIn + " FAILED")
        return tmpRetObj # retval
    def getArtifactByName(self,artiNameIn):
        retval = False
        try:
            vldb = VodLibDB()
            resList = vldb.getArtifactListByTitleFrag(artiNameFragStrIn)
            artiId = resList[0]['artifactid']
            retval = self.getArtifactById(artiId)
        except:
            print(getArtifactByName + ": DUNG!")
        return retval
    def addTagtoArtifact(self,tagStrIn,artifactIdIn):
        retval = False
        stepfail = False
        ntag = self.__normalizeTagStr(tagStrIn)
        vldb = VodLibDB()
        retval = vldb.addTagtoArtifact(ntag,artifactIdIn)
        return retval
    def addTagToSeries(self,tagIn,seriesAIDIn):
        nTag = self.__normalizeTagStr(tagIn)
        vldb = VodLibDB()
        retval = vldb.assignTagToSeries(seriesAIDIn, nTag)
        return retval
    def removeTagFromArtifact(self,tagStrIn,artifactIdIn):
        retval = False
        ntag = self.__normalizeTagStr(tagStrIn)
        try:
            vldb = VodLibDB()
            retval = vldb.removeTagFromArtifact(artifactIdIn,ntag)
        except:
            print("Well, poop.")
        pass
        return retval
    def getArtifactsByTag(self,tagStrIn):  
        ntag = self.__normalizeTagStr(tagStrIn)
        retobj = []
        try:
            vldb = VodLibDB()
            retobj = vldb.getArtifactListByTagList([ntag])
        except:
            print('getArtifactsByTag  BARF')
            pass
        pass
        return retobj
    def getArtifactsByMajtype(self,majtypeStrIn):
        retobj = [];
        try:
            vldb = VodLibDB()
            retobj = vldb.getArtifactListByMajtype(majtypeStrIn)
            pass
        except:
            print('getArtifactsByMajtype  BARF')
            pass
        pass
        return retobj
    def getArtifactsByRelyear(self,relyear1In,relyear2In):
        retobj = [];
        try:
            vldb = VodLibDB()
            retobj = vldb.getArtifactListByRelyear(relyear1In,relyear2In)
            pass
        except:
            print('getArtifactsByRelyear  BARF')
            pass
        pass
        return retobj  
    def findArtifactsBySrchStr(self,srchStrIn): # UPDATED FOR NEW RETURN OBJECT MODEL 
        #ntag = self.__normalizeTagStr(srchStrIn)
        tmpRetObj = copy.deepcopy(self.libMeta['retdicttempl'])
        tmpRetObj['method'] = 'findArtifactsBySrchStr'
        tmpRetObj['params'] = [srchStrIn]
        #tmpRetObj['status']['success'] = True
        
        retobj = []
        # print ('findArtifactsBySrchStr: ' + str(type(srchStrIn)) + str(srchStrIn))
        try:
            vldb = VodLibDB()
            retobj = vldb.getArtifactListByPersTitleStr(str(srchStrIn))
            tmpRetObj['data'] = retobj
            tmpRetObj['status']['success'] = True
        except:
            print('findArtifactsBysrchStr  BARF')
            pass
        pass
        return tmpRetObj
    def getArtifactsByMultiFactorSrch(self,mfSrchObjIn): # UPDATED FOR NEW RETURN OBJECT MODEL 
        # {"tag":"science_fiction","string":"star","majtype":"movie","relyearstart":"","relyearend":"","sqlwhere":""}
        
        tmpRetObj = copy.deepcopy(self.libMeta['retdicttempl'])
        tmpRetObj['method'] = 'getArtifactsByMultiFactorSrch'
        tmpRetObj['params'] = [mfSrchObjIn]
        #tmpRetObj['status']['success'] = True        
        
        retobj = []
        idList = []
        tmpResObj = {"tag":[],"string":[],"majtype":[],'relyear':[],'sqlwhere':[]}
        if (mfSrchObjIn['tag'] != ''):
            tmpResObj['tag'] = self.getArtifactsByTag(mfSrchObjIn['tag'])
        if (mfSrchObjIn['string'] != ''):
            tmpResObj['string'] = self.findArtifactsBySrchStr(mfSrchObjIn['string'])
        if (mfSrchObjIn['majtype'] != ''):
            tmpResObj['majtype'] = self.getArtifactsByMajtype(mfSrchObjIn['majtype'])
        if (mfSrchObjIn['relyearend'] != ''):
            try:
                tmpResObj['relyear'] = self.getArtifactsByRelyear(int(mfSrchObjIn['relyearstart']),int(mfSrchObjIn['relyearend']))
            except:
                if int(mfSrchObjIn['relyearend']) > 1900:
                    tmpResObj['relyear'] = self.getArtifactsByRelyear(int(mfSrchObjIn['relyearend']),int(mfSrchObjIn['relyearend']))
                else:
                    print('Cannot process dates.  Sad.')
        if (mfSrchObjIn['sqlwhere'] != ''):
            tmpResObj['sqlwhere'] = self.getArtifactsByArbWhereClause(mfSrchObjIn['sqlwhere'])
        
        for key in list(tmpResObj.keys()):
            if len(tmpResObj[key]) > 0:
                if len(idList) == 0:
                    #tmpIdList = []
                    for lElObj in tmpResObj[key]:
                        idList.append(lElObj['artifactid'])
                    pass
                else:
                    tmpIdList = []
                    for lElObj in tmpResObj[key]:
                        if lElObj['artifactid'] in idList:
                            tmpIdList.append(lElObj['artifactid'])
                        pass
                    pass
                    idList = tmpIdList
                pass
            pass
        pass
        vldb = VodLibDB()
        retobj = vldb.getArtifactListByIdList(idList);
        tmpRetObj['status']['success'] = True 
        tmpRetObj['data'] = retobj
        return tmpRetObj        
    def getArtifactsByArbWhereClause(self,whereClauseStrIn):
         # getArtifactListByArbWhereClause
        retobj = []
        print ('MediaLibraryDB.getArtifactsByArbWhereClause: ' + whereClauseStrIn)
        try:
            vldb = VodLibDB()
            retobj = vldb.getArtifactListByArbWhereClause(whereClauseStrIn)
            print("WHEE!")
        except:
            print('getArtifactsByArbWhereClause  BARF')
            pass
        pass
        return retobj
    def findArtifactsByName(self,artiNameFragStrIn):
        vldb = VodLibDB()
        resList = vldb.getArtifactListByTitleFrag(artiNameFragStrIn)
        return resList
    def getIdTitleListBySeriesArtiId(self,atriIdIn): # UPDATED FOR NEW RETURN OBJECT MODEL
        tmpRetObj = copy.deepcopy(self.libMeta['retdicttempl'])
        tmpRetObj['method'] = 'getIdTitleListBySeriesArtiId'
        tmpRetObj['params'] = [atriIdIn]
        tmpRetObj['status']['success'] = True
        vldb = VodLibDB()
        tmpRetObj['data'] = vldb.getEpisodeTIMListBySeriesId(atriIdIn)
        return tmpRetObj
    def getTagsByArtifact(self,artifactIdIn):
        retval = False
        try:
            tagsList = self.libDict['a2t'][artifactIdIn]
            retval = tagsList
        except:
            print('getTagsByArtifact: POOP')
        pass
        return retval
    def getArtifactPrototype(self):
        artiProtoDict = {}
        artiProtoDict = copy.deepcopy(self.artifactProto)
        pass
        return artiProtoDict
    def fetchDeetsFromApi(self):
        print("ml.fetchDeetsFromApi")
        vldb = VodLibDB()
        vldb.fetchArtiDeetsFromOmdbapi()
        return True
    def getArtifactLackingImdbid(self,majtypeIn):
        vldb = VodLibDB()
        retDict = vldb.getArtifactNeedingImdbId(majtypeIn)
        return retDict
    def updateArtifactImdbid(self,artiIdIn,imdbidIn):
        vldb = VodLibDB()
        vldb.setImdbId(artiIdIn,imdbidIn)
    def updateArtiDeetsFromOmdb(self,artiIdIn):
        artiDict = self.getArtifactById(artiIdIn)
        arbmetaStr = artiDict['arbmeta']
        print(arbmetaStr)
        arbMetaDict = None
        try:
            arbMetaDict = json.loads(arbmetaStr)
        except:
            print('Could not json.loads arbmetaStr. ')
            return False
        amdKeysList = list(arbMetaDict.keys())
        if not ( 'Title' in amdKeysList ):
            # This artifact does not have a "Title" key
            # so we're going to skip it.
            return False
        pass
        updateDict = {}
        # Get "writer" values and put them in a List
        writerList = arbMetaDict['Writer'].split(',')
        if len(writerList) > 0:
            updateDict['writer'] = []
        pass
        for writer in writerList:
            updateDict['writer'].append(writer.strip())
        pass
        
        # Get "Director" values and put them in a List
        directorList = arbMetaDict['Director'].split(',')
        if len(directorList) > 0:
            updateDict['director'] = []
        for director in directorList:
            updateDict['director'].append(director.strip())
        pass
        
        # Get "Actor" values and put them in a List
        actorList = arbMetaDict['Actors'].split(',')
        if len(actorList) > 0:
            updateDict['primcast'] = []
        for actor in actorList:
            updateDict['primcast'].append(actor.strip())
        pass
        
        # Get the "Plot" value and put it in an artitext
        plotStr = arbMetaDict['Plot'].replace("'","\\\'")
        self.createArtitext(artiIdIn,'synopsis',plotStr)
        
        # Update the artifact in the DB based on the values 
        # pulled from OMDBAPI data
        retval = self.modifyArtifact(artiIdIn,updateDict)
        
        return retval
    def fetchPosterLink(self,imdbidIn):
        posterUri = ''
        if imdbidIn == 'string' or imdbidIn == 'none' or imdbidIn == '':
            return posterUri
        # print("fetchPosterLink - Attempting to fetch for " + imdbidIn)
        try:
            api_url = "http://www.omdbapi.com/?i=" + imdbidIn + "&apikey=87edb0eb"
            response = requests.get(api_url)
            responseDict = response.json()
            posterUri = responseDict['Poster']
        except:
            print("fetchPosterLink Failed to fetch " + api_url)
            pass
        # print("Got back Poster URI: " + posterUri)
        return posterUri        
    def fetchPosterFile(self,imdbidIn):
        if imdbidIn == '' or imdbidIn == 'string' or imdbidIn == 'none':
            print("fetchPosterFile - Got a bad imdbid: " + str(imdbidIn))
            return ''
        baseDir = '/var/www/html'
        uriPath = '/rmvod/img/poster_00/' + imdbidIn + '.jpg'
        filnm = baseDir + uriPath
        if not (os.path.exists(filnm)):
            # print("fetchPosterFile - Apparently " + filnm + " does not exist locally.  Trying to fetch it ")
            try: 
                posterUri = self.fetchPosterLink(imdbidIn)
                response = requests.get(posterUri)
                fh = open(filnm,"wb")
                fh.write(response.content)
                fh.close()
            except:
                print('Tried to fetch ' + posterUri + ' and save it as ' + filnm + ' but failed miserably')
                uriPath = ''
                pass
            pass
        return uriPath
    def librarifyTitle(self,titleIn):
        titleOut = titleIn
        if titleIn[0:4] == "The ":
            titleOut = titleIn[4:] + ", The"
        elif titleIn[0:2] == "A ":
            titleOut = titleIn[2:] + ", A"
        return titleOut
    def titleLibTweak(self,artiObjIn):
        arbmetaDict = {}
        try:
            arbmetaDict = json.loads(artiObjIn['arbmeta'])
        except:
            print('titleLibTweak - json.loads failed on arbmeta for ' + artiObjIn['title']);
        straightTitle = artiObjIn['title']
        libTitle = self.librarifyTitle(straightTitle)
        arbmetaDict['titleorig'] = straightTitle
        arbmetaDict['titlelibrary'] = libTitle
        artiObjIn['arbmeta'] = json.dumps(arbmetaDict)
        return artiObjIn
    def addEpisodesToSeries(self,seriesArtiIdIn,filePathIn,fnFragIn): # UPDATED FOR NEW RETURN OBJECT MODEL
        vldb = VodLibDB()

        #retDict = {'method':addEpisodesToSeries,'params':[seriesArtiIdIn,filePathIn,fnFragIn],'result':[]}
        retDict = {}
        retDict['method'] = 'addEpisodesToSeries'
        retDict['params'] = [seriesArtiIdIn,filePathIn,fnFragIn]
        retDict['status'] = {'success':False,'detail':'','log':[]}
        retDict['data'] = []
        
        serEpiList = vldb.getEpisodeListBySeriesId(seriesArtiIdIn)
        
        # > Confirm the seriesArtiId is good
        # > Get tags associated with the series
        seriesArti = self.getArtifactById(seriesArtiIdIn)
        
        # > Get list of "tvepisode" artifacts with the filePath and fnFrag
        episodeList = vldb.getTVEposidesByPathFileFrag(filePathIn,fnFragIn)
        # print('addEpisodesToSeries - episodeList: ' + str(episodeList))
        # episodeAIDList = []
        # for epiDict in episodeList:
            # episodeAIDList.append(epiDict['artifactid'])
        
        seriesAddList = []
        failCount = 0
        if (len(episodeList) > 0):
            # > For each artifact:
            for artifactDict in episodeList:
                # > Confirm the artifact's file is present
                filExist = self.artifactFileCheck(filePathIn,artifactDict['file'])
                # > If not, skip it (Maybe print something(?))
                if filExist == False:
                    xStr = 'File does not exist: ' + artifactDict['file']
                    retDict['status']['log'].append(xStr)
                    failCount += 1
                    #raise Exception(xStr)
                    continue
                pass
                # > Is it is already associated with a series?
                if artifactDict['artifactid'] in serEpiList:
                    # > If so:
                    # > Skip it (Maybe print something(?))
                    xStr = "Artifact is already an associated episode: " + artifactDict['artifactid']
                    retDict['status']['log'].append(xStr)
                    print(xStr)
                    continue
                else:
                    pass
                    # > If not:
                    # > Add it to the series (insert into s2e)
                    # seriesAddList.append(artifactDict['artifactid'])
                    vldb.addEpisodeToSeries(seriesArtiIdIn,artifactDict['artifactid'])
                    # > Add tags associated with the series to the artifact (?)
                    # > Append it to retDict['result']
                    retDict['data'].append(artifactDict['artifactid'])
                    xStr = "Artifact added to series: " + artifactDict['artifactid']
                    retDict['status']['log'].append(xStr)
                pass
            pass
        else:
            failCount += 1
            retDict['status']['detail'] = "No artifacts found for Path " + filePathIn + " and Filename fragment " + fnFragIn
        
        pass
        if failCount == 0:
            retDict['status']['success'] = True
        return retDict
    def apiCreateSingleArtifact(self,argDictIn): # UPDATED FOR NEW RETURN OBJECT MODEL
        
        tmpRetObj = copy.deepcopy(self.libMeta['retdicttempl'])
        tmpRetObj['method'] = 'apiCreateSingleArtifact'
        tmpRetObj['params'] = [argDictIn]
        # tmpRetObj['status']['success'] = True        
        
        assert type(argDictIn) == type({'this':'that'})
        dictIn = argDictIn
        # result = {'status':'failed','statusdetail':'did not even begin','data':{'artifactid':''}}
        tmpRetObj['status']['success'] = False
        tmpRetObj['status']['detail'] = 'did not even begin'
        tmpRetObj['data'] = [{'artifactid':''}]
        evenTry = True
        # print('apiCreateSingleArtifact: ' + json.dumps(tmpRetObj))
        if dictIn['majtype'] != 'tvseries':
            try:
                #print("Trying newArtiPreCheck...",dictIn['filepath'],dictIn['file'])
                checkVal = self.newArtiPreCheck(dictIn['filepath'],dictIn['file'])
                #print(checkVal)
                assert checkVal == True
                #print("Tried newArtiPreCheck.")
            except:
                evenTry = False
                sdStr = "Artifact for file = " + dictIn['file'] 
                sdStr += " already exists, or file is not present in the specified path."
                #result = {'status':'failed','statusdetail':sdStr,'data':{'artifactid':''}}
                tmpRetObj['status']['success'] = False
                tmpRetObj['status']['detail'] = sdStr
                tmpRetObj['data'] = [{'artifactid':''}]
        else:
            #print("Skipping file pre-test because this is a tvseries")
            pass
        pass
        if evenTry == True:
            try:
                print("trying newSingleArtifact...")
                artifactid = str(uuid.uuid4())
                artiData = {}
                artiData['title'] = dictIn['file']
                # if dictIn['majtype'] == 'tvseries':
                    # artiData['file'] = ''
                # else:
                    # artiData['file'] = dictIn['file']
                artiData['file'] = dictIn['file']
                artiData['majtype'] = dictIn['majtype']
                artiData['filepath'] = dictIn['filepath']
                artiData['runmins'] = -1
                artiData['season'] = -1
                artiData['episode'] = -1
                artiData['relyear'] = -1
                artiData['director'] = '[]'
                artiData['writer'] = '[]'
                artiData['primcast'] = '[]'
                artiData['relorg'] = '[]'
                artiData['eidrid'] = 'string'
                artiData['imdbid'] = 'string'
                artiData['arbmeta'] = '{}'
                # artiData['tags'] = str(dictIn['tags'])
                #artiData[''] = '';
                # artifactid = self.createArtifact(artiData)
                # result = {'status':'success','statusdetail':dictIn['file'],'data':{'artifactid':artifactid}}
                tmpRetObj['status']['success'] = True
                tmpRetObj['status']['detail'] = dictIn['file']
                tmpRetObj['data'] = [{'artifactid':artifactid}]

            except:
                print("newSingleArtifact EXCEPTION!")
                detailStr = 'Attempt to insert failed with input values ' + json.dumps(dictIn) + ' and artifact values ' + json.dumps(artiData)
                # print(detailStr)
                # result = {'status':'failed','statusdetail':detailStr,'data':{'artifactid':artifactid}}
                tmpRetObj['status']['success'] = False
                tmpRetObj['status']['detail'] = detailStr
                tmpRetObj['data'] = [{'artifactid':artifactid}]
                pass
            pass
        # print(json.dumps(tmpRetObj))
        return tmpRetObj
        

class MLCLI:
    def __init__(self):
        self.ml = MediaLibraryDB()
        
        self.mainMenuList = []
        self.mainMenuList.append({'label':'Create new Artifact','detail':'Create new Artifact','func':self.doNewArti})
        self.mainMenuList.append({'label':'Create new Artifacts from a File List','detail':'Create new Artifacts from a File List','func':self.doNewArtisFromFile})
        self.mainMenuList.append({'label':'List Available Tags','detail':'List Available Tags','func':self.listTags})
        self.mainMenuList.append({'label':'Create New Tag','detail':'Create New Tag','func':self.doNewTag})
        self.mainMenuList.append({'label':"Get Artifacts By Tag",'detail':'Get Artifacts By Tag','func':self.artiByTag})
        self.mainMenuList.append({'label':"Get Artifacts By Search String",'detail':'Get Artifacts By Search String','func':self.srchArtiByTitle})
        self.mainMenuList.append({'label':"Get Artifacts Detail By ID",'detail':'Get Artifacts Detail By ID','func':self.srchArtiDetailById})
        self.mainMenuList.append({'label':'Edit Artifact By ID','detail':'Edit Artifact By ID','func':self.doEditArtiById}) #doEditArtiById
        self.mainMenuList.append({'label':'Add Tag to Artifact','detail':'Add Tag to Artifact','func':self.doTagToArti})
        self.mainMenuList.append({'label':'Add Tag to TV Series','detail':'Add Tag to TV Series','func':self.doTagToSeries})
        self.mainMenuList.append({'label':'Remove Tag from Artifact','detail':'Remove Tag from Artifact','func':self.doTagFromArti})
        # self.mainMenuList.append({'label':'Emergency Title Fix','detail':'string','func':self.doTitleFix})
        # self.mainMenuList.append({'label':'Save Library','detail':'Save Library','func':self.doSaveLib})
        self.mainMenuList.append({'label':'Fetch some Artifact details from API','detail':'string','func':self.doArtiDeetApiFetch})
        self.mainMenuList.append({'label':'Add missing IIMDB ID','detail':'Add missing IIMDB ID','func':self.doAddMissingImdbid})
        self.mainMenuList.append({'label':'Update Arti Deets from OMDBAPI data','detail':'Update Arti Deets from OMDBAPI data','func':self.doUpdateArtiFromOmdb})
        self.mainMenuList.append({'label':'Exit','detail':'','func':self.doExit})
        # self.mainMenuList.append({'label':'string','detail':'string','func':None})
        
        self.libDirty = False
        pass
    def __artiEditForm(self,artiDictIn):
        retDict = copy.deepcopy(artiDictIn)
        tmpArtiDict = copy.deepcopy(artiDictIn)
        aProtoKeys = list(tmpArtiDict.keys())
        del aProtoKeys[aProtoKeys.index('artifactid')]
        print('-=-=-=-=-=- BEGIN =-=-=-=-=-=\n')
        for aKey in aProtoKeys:
            tmpVal = input('Enter ' + aKey + ' for this Artifact\n  (<Enter> to accept default value: ' + str(tmpArtiDict[aKey]) + ')\n  Your value: ')
            print(tmpVal)
            if (tmpVal == ''):
                continue
            
            if (type(tmpArtiDict[aKey]) == type('string')):
                # Do the string thing
                tmpArtiDict[aKey] = tmpVal.strip()
                pass
            else:
                # Do some other magic for the Prototype's type
                print('Handle ' + tmpVal + ' as ' + str(type(tmpArtiDict[aKey])))
                if (type(tmpArtiDict[aKey]) == type(-1)):
                    tmpArtiDict[aKey] = int(tmpVal)
                elif (type(tmpArtiDict[aKey]) == type([])):
                    ### THIS REALLY OUGHT TO HAVE A TRY/EXCEPT ON IT
                    tmpArtiDict[aKey] = json.loads(tmpVal)  # list(tmpVal)
                elif (type(tmpArtiDict[aKey]) == type({})):
                    ### THIS REALLY OUGHT TO HAVE A TRY/EXCEPT ON IT
                    tmpArtiDict[aKey] = json.loads(tmpVal)  # dict(tmpVal)
                elif (type(tmpArtiDict[aKey]) == type(False)):
                    tmpArtiDict[aKey] = bool(tmpVal)
                elif (type(tmpArtiDict[aKey]) == type(3.14)):
                    tmpArtiDict[aKey] = float(tmpVal)
                else:
                    print('IDK WTF')
                pass
            pass
            print('')
        pass
        return tmpArtiDict
    def mainMenuPreso(self):
        print('Media Library Main Menu')
        print('=-=-=-=-=-=-=-=-=-=-=-=')
        mmIdx = 0
        mmLen = len(self.mainMenuList)
        for mmIdx in range(0,mmLen):
            print(str(mmIdx) + ') ' + self.mainMenuList[mmIdx]['label'])
        pass
        print('')
        retval = input('Select a number from the options above:')
        return retval
    def mainMenuSelInterp(self,selectionIn):
        retval = True
        noodle = self.mainMenuList[int(selectionIn)]['func']
        retval = noodle()
        return retval
    def mainLoop(self):
        contYN = True
        while (contYN == True):
            userSelection = self.mainMenuPreso()
            contYN = self.mainMenuSelInterp(userSelection)
        pass
        return False
    def artiByTag(self):
        tagStr = input("Enter your tag: ")
        print('\nArtifacts for Tag ' + tagStr + ':')
        print('-=-=-=-=-=- BEGIN =-=-=-=-=-=\n')
        pLineList = []
        try:
            artiList = self.ml.getArtifactsByTag(tagStr)
            for arti in artiList:
                print(arti['title'] + ' (' + arti['artifactid'] + ')')
                pLineList.append(arti['title'])
            pass
        except:
            print('Operation failed')
        print('\n-=-=-=-=-=- DONE =-=-=-=-=-=\n')
        return True
    def srchArtiByTitle(self):
        srchStr = input("Enter your Title search string: ")
        print('\nArtifacts for search string ' + srchStr + ':')
        print('-=-=-=-=-=- BEGIN =-=-=-=-=-=\n')
        pLineList = []
        try:
            artiList = self.ml.findArtifactsByName(srchStr)
            for arti in artiList:
                print(arti['title'] + ' (' + arti['artifactid'] + ')')
                pLineList.append(arti['title'])
            pass
        except:
            print('Operation failed')
        print('\n-=-=-=-=-=- DONE =-=-=-=-=-=\n')
        return True
        return self.fakeFunc()
    def srchArtiDetailById(self):
        artiIdStr = input('Enter the ID: ')
        
        aDict = self.ml.getArtifactById(artiIdStr)
        tList = [] 
        
        print('-=-=-=-=-=- BEGIN =-=-=-=-=-=\n')
        print("Artifact details: " + str(aDict))
        print("\nTags associated: " + str(tList))
        print('\n-=-=-=-=-=- DONE =-=-=-=-=-=\n')
        return self.fakeFunc()
    def listTags(self):
        tagList = self.ml.getTagList()
        print("\nAvailable Tags")
        print('-=-=-=-=-=- BEGIN =-=-=-=-=-=\n')
        print(str(tagList))
        print('\n-=-=-=-=-=- DONE =-=-=-=-=-=\n')
        return self.fakeFunc()
    def doTagToArti(self):
        tagStr = input('Enter the tag: ')
        titleStr = input('Enter the Title of the Artifact: ')
        tagOK = self.ml.findTag(tagStr)
        artiList = self.ml.findArtifactsByName(titleStr)
        print(str(tagOK))
        print(str(artiList))
        if ((tagOK > -1) and (len(artiList) > 0)):
            # Tag provided is OK and we have artifact(s) to work with
            taggedList = []
            for artiDict in artiList:
                aId = artiDict['artifactid']
                taRes = self.ml.addTagtoArtifact(tagStr,aId)
                if (taRes == True):
                    taggedList.append(artiDict['name'])
                pass
            pass
            print('Tagged ' + str(len(taggedList)) + ' artifacts.')
            self.libDirty = True
        else:
            # Tag provided is poop or there are no artifacts
            print('Tag provided is poop or there are no artifacts')
        pass
        return True
    def doTagToSeries(self):
        tagStr = input('Enter the tag: ')
        serArtiId = input('Enter the Artifact ID of the Series: ')
        self.ml.addTagToSeries(tagStr,serArtiId)
        return True
    def doTagFromArti(self):
        tagStr = input('Enter the tag: ')
        titleStr = input('Enter the Title of the Artifact: ')
        tagOK = self.ml.findTag(tagStr)
        artiList = self.ml.findArtifactsByName(titleStr)
        print(str(tagOK))
        print(str(artiList))
        if ((tagOK > -1) and (len(artiList) > 0)):
            # Tag provided is OK and we have artifact(s) to work with
            taggedList = []
            for artiDict in artiList:
                aId = artiDict['artifactid']
                taRes = self.ml.removeTagFromArtifact(tagStr,aId)
                if (taRes == True):
                    taggedList.append(artiDict['name'])
                pass
            pass
            print('Tagged ' + str(len(taggedList)) + ' artifacts.')
            pass
            self.libDirty = True
        else:
            # Tag provided is poop or there are no artifacts
            print('Tag provided is poop or there are no artifacts')
        pass
        return True
    def doNewArti(self):
        tmpArtiDict = self.__artiEditForm(self.ml.getArtifactPrototype())
        print(str(tmpArtiDict))
        print(str(self.ml.createArtifact(tmpArtiDict)))
        self.libDirty = True
        print('\n-=-=-=-=-=- END =-=-=-=-=-=\n')
        return True
    def doNewArtisFromFile(self):
        
        # We want to take in:
         # a FQ path to a file which contains a list of ".m4v" files
         # a relative file path where the files listed in the list file can be found
         # an optional "starter tag" to apply to all Artifacts created for the files
         # an optional "majtype" value to apply to all  all Artifacts created for the files
        # Load the "file list" file, and iterate over the list:
         # for each filename:
          # create a new Artifact, and set its "file" to the value from the "file list" file
          # set optional "majtype" if given
          # run through the list of keys for the Artifact
          # save the artifact to the Library
          # if an optional "starter tag" was provided, apply it
          # give an opportunity to apply further tags (<Enter> if none)
        # Remind the user to save the library.
        flfFQSpec = None
        artiFilePath = None
        
        stepOK = False
        while stepOK == False:
            flfFQSpec = input("Please provide a fully-qualified filespec for the \nList File: ")
            if os.path.exists(flfFQSpec):
                stepOK = True
            else:
                print(">> File " + flfFQSpec + " not found.  Try again.")
            pass
        pass
        stepOK = False
        while stepOK == False:
            artiFilePath = input("Please provide an Artifact \nRelative Path: ")
            
            validOK = False
            # Do some validation
            if type(artiFilePath) == type("string"):
                if artiFilePath != "":
                    validOK = True
                pass
            if validOK == True:
                stepOK = True
            pass
        pass
        stepOK = False
        while stepOK == False:
            artiFirstTag = input(">OPTIONAL< Please provide an Artifact \nStarter Tag (or <Enter> to skip): ")
            if artiFirstTag == "":
                # SKIP!
                stepOK = True
            else:
                validOK = False
                # Some validation, maybe?!
                if type(artiFirstTag) == type("string"):
                    if artiFirstTag != "":
                        #We should make sure the tag is valid!
                        tagOK = self.ml.findTag(artiFirstTag)
                        if tagOK > -1:
                            validOK = True
                        pass
                    pass
                if validOK == True:
                    stepOK = True
                pass
            pass
        pass
        stepOK = False
        while stepOK == False:
            artiMajTyp = input(">OPTIONAL< Please provide an Artifact \nMajor Type (or <Enter> to skip): ")
            if artiMajTyp == "":
                # SKIP!
                stepOK = True
            else:
                validOK = False
                # Some validation, maybe?!
                if type(artiMajTyp) == type("string"):
                    if artiMajTyp != "":
                        validOK = True
                    pass #                validOK = True
                if validOK == True:
                    stepOK = True
                pass
            pass
        pass
        stepOK = False
        perArtiDetail = False
        while stepOK == False:
            detailResp = input("Enter individual details per-artifact?\n(y/N): ")
            if detailResp == "y" or detailResp == "Y":
                # SKIP!
                perArtiDetail = True
                stepOK = True
            else:
                stepOK = True
                pass
            pass
        pass
        
        # Bring in the file list
        flfContList = []
        try:
            fh2 = open(flfFQSpec,'r')
            for line in fh2:
                flfContList.append(line.strip())
            fh2.close()
        except IOError as error:
            print('File Sad: ' + str(error))
        else:
            pass
        finally:
            pass
        pass        
        
        # Iterate over the list of File List Files
        for flfFileName in flfContList:
            print("\n====>> BEGIN - File " + flfFileName + "\n")
            # Create the Artifact and preload known values
            thisArtiDict = self.ml.getArtifactPrototype()
            thisArtiDict['file'] = flfFileName
            thisArtiDict['filepath'] = artiFilePath
            if (type(artiMajTyp) == type("string")):
                if (artiMajTyp != ""):
                    thisArtiDict['majtype'] = artiMajTyp
                pass
            pass
            
            if perArtiDetail == True:
                # Run the form
                tmpArtiDict = self.__artiEditForm(thisArtiDict)
            else:
                tmpArtiDict = thisArtiDict
                thisArtiDict['title'] = flfFileName
            pass
            
            # Store the Artifact
            thisArtiId = self.ml.createArtifact(tmpArtiDict)
            
            # Add Starter Tag
            if (type(artiFirstTag) == type("string")):
                if (artiFirstTag != ""):
                    taRes = self.ml.addTagtoArtifact(artiFirstTag,thisArtiId)
                pass
            pass
            
            # Opportunity to add more tag(s)
            # COMING SOON!  WATCH THIS SPACE!
            pass
            
            print("\n====>> END - File " + flfFileName + "\n")
            
        pass
 
        print("\n\nOK, that's it!\nPLEASE make sure you save the library to ensure\nall this hard work won't be lost!\n\n")       
        
        return self.fakeFunc()
    def doEditArtiById(self):
        artiIdStr = input('Enter the ID: ')
        aDict = self.ml.getArtifactById(artiIdStr)
        tList = self.ml.getTagList()
        artiEditedDict = self.__artiEditForm(aDict)
        print("artiEditedDict: " + str(artiEditedDict))
        result = self.ml.modifyArtifact(artiIdStr,artiEditedDict)
        print("self.ml.modifyArtifact result: " + str(result))
        return self.fakeFunc()
    def doNewTag(self):
        newTagStr = input("Enter your new Tag: ")
        self.libDirty = True
        return self.ml.createTag(newTagStr)
    def doSaveLib(self):
        print("Saving the library...")
        print(str(self.ml.saveLibraryToFile()))
        self.libDirty = False
        return True
    def doExit(self):
        if (self.libDirty == True):
            saveYN = input("Save before exit (y/N)? ")
            if (saveYN in ['y','Y']):
                print(str(self.doSaveLib()))
            pass
        pass
        return False
    def doArtiDeetApiFetch(self):
        print("cli.doArtiDeetApiFetch")
        self.ml.fetchDeetsFromApi()
        return True
    def doAddMissingImdbid(self):
        reqDict = self.ml.getArtifactLackingImdbid('movie')
        imdbidIn = input("Enter IMDB ID value for Artifact " + reqDict['title'] + ": ")
        self.ml.updateArtifactImdbid(reqDict['artifactid'],imdbidIn)
        cont1yn = input("Continue with OMDBAPI fetch?\n[ y / N ]: ")
        if cont1yn in ['y','Y']:
            self.ml.fetchDeetsFromApi()
            cont2yn = input("Continue with Artifact details update from OMDBAPI data?\n[ y / N ]: ")
            if cont2yn in ['y','Y']:
                self.ml.updateArtiDeetsFromOmdb(reqDict['artifactid'])
            pass
        pass
        return True
    def doUpdateArtiFromOmdb(self):
        artiId = input("doUpdateArtiFromOmdb - Input\nArtifact ID: ")
        self.ml.updateArtiDeetsFromOmdb(artiId)
        return True
    def fakeFunc(self):
        return True

pass

@app.route('/')
def index():
    ## THE FOLLOWING HTML SHOULD PROBABLY NOT BE HERE FOR FUTURE USE.
    ## IT IS INTENDED PRIMARILY FOR DEVELOPMENT AND TESTING OF THE 
    ## WEB SERVICE FOR RMPC
    
    # retval = """<html>
    # <head>
        # <style>
            
           
            # body {
                # font-family: arial;
                # font-size: small;
                # color: #cccccc;
                # background-color: #222222;
            # }
            # div {
                # margin: 0px;
                # margin-left: 0px;
                # margin-right: 0px;
                # margin-top: 0px;
                # margin-bottom: 0px;
                # padding: 0px;
                # border: 1px solid gray;
                # /* border: 0px; */
            # }            
            
            # div.artifact-default-disp-cell {
                # display:inline-flex;
                # border-width: 1px;
                # border-color: #000000;
                # border-style: solid;
                # padding:3px;
            # }
        # </style>
        # <script type="text/javascript" src="http://freezer/freezer/js/RMWebAppCoreUtil.js"></script>
        # <script type="text/javascript" src="http://localhost/vodlib/js/vodlibsketch.js"></script>
    # </head>
    # <body onload="switchboard('firstthing','',{})">
        # <div id="vodlibworld" style="width:720px;height:720;overflow:auto;">
            # <div id="titletop"  style="width:700px; height:50px;">
                # <b>RIBBBITVOD</b><br>
            # </div>
            # <div id='big-search-container' style="width:700px; height:400px; display:none;"></div>
            # <div id="div00"  style="width:700px; height:400px;">
                # <div id="playercontainer">a player might go here</div>
            # </div>
            # <div id="div01" style="width:700px;height:250px;overflow:auto;"></div>
        # </div>
        # <!-- text after div01 -->
    # </body>
# </html>
# """
    retval = """<!DOCTYPE html>

<!-- rmvod.html version 0.4.3  -->

<!--
rmvod.html  Copyright 2022, 2023 Paul Tourville

This file is part of RIBBBITmedia VideoOnDemand (a.k.a. "rmvod").

RIBBBITmedia VideoOnDemand (a.k.a. "rmvod") is free software: you 
can redistribute it and/or modify it under the terms of the GNU 
General Public License as published by the Free Software 
Foundation, either version 3 of the License, or (at your option) 
any later version.

RIBBBITmedia VideoOnDemand (a.k.a. "rmvod") is distributed in the 
hope that it will be useful, but WITHOUT ANY WARRANTY; without 
even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
PARTICULAR PURPOSE. See the GNU General Public License for more 
details.

You should have received a copy of the GNU General Public License 
along with RIBBBITmedia VideoOnDemand (a.k.a. "rmvod"). If not, 
see <https://www.gnu.org/licenses/>.
-->

<html>
    <head>
        <link rel="stylesheet" href="/rmvod/css/rmvod_core.css">
        <style>
        </style>
        <script type="text/javascript" src="/rmvod/js/RMWebAppCoreUtil.js"></script> 
        <script type="text/javascript" src="/rmvod/js/rmvod_wa_core.js"></script> 
    </head>
    <body onload="switchboard('firstthing','',{})">
        <div class="mastercont" id="mastercont" style="width:1210px;height:760px;"> <!-- 710px; -->
        </div>
    </body>
</html>
    
    
"""
    return retval

###### DEPRECATED
# @app.route('/blob/get',methods=['POST'])
# def blobRead():
    # ml = MediaLibraryDB()
    # ml.loadLibraryFromFile()
    # return ml.extractJsonLibrary()

@app.route('/apiversion/get',methods = ['POST','GET'])
def apiVersion():  # UPDATED FOR NEW RETURN OBJECT MODEL
    ml = MediaLibraryDB()
    # cssVerStr = ml.readCssFile('../css/vodlib.css')
    # htmlVerStr = ml.readHtmlFile('../vodlib_static_3.html')
    cssVerStr = ml.readCssFile('/var/www/html/rmvod/css/rmvod_core.css')
    htmlVerStr = ml.readHtmlFile('/var/www/html/rmvod/rmvod.html')
    
    tmpRetObj = copy.deepcopy(ml.libMeta['retdicttempl'])
    tmpRetObj['method'] = 'apiVersion'
    tmpRetObj['status']['success'] = True
    tmpRetObj['data'] = [{'api_version':versionStr,'api_file':fileStr,'db_version':ml.getDBVersion(),'css_version':cssVerStr,'html_version':htmlVerStr}]
    
    
    # tmpRetObj = {'api_version':versionStr,'api_file':fileStr,'db_version':ml.getDBVersion(),'css_version':cssVerStr,'html_version':htmlVerStr}
    return json.dumps(tmpRetObj)

@app.route('/titleidlist/get',methods=['POST','GET'])
def getListTitleId():  # UPDATED FOR NEW RETURN OBJECT MODEL
    
    ###  THIS Model should really be pushed upstream, but
    ###  this configuration just gets us working sooner.
    ml = MediaLibraryDB()
    tmpRetObj = copy.deepcopy(ml.libMeta['retdicttempl'])
    tmpRetObj['method'] = 'getListTitleId'
    #tmpRetObj['status']['success'] = True
    #tmpRetObj['data'] = [{'api_version':versionStr,'api_file':fileStr,'db_version':ml.getDBVersion(),'css_version':cssVerStr,'html_version':htmlVerStr}]
        
    
    dictIn = {}
    diKeysList = []
    try:
        dictIn = yaml.safe_load(json.dumps(request.json))
        diKeysList = list(dictIn.keys())
        pass
    except:
        dictIn = {}
        diKeysList = []
    pass
    #ml = MediaLibraryDB()
    if "title" in diKeysList:
        # Let's search for artifacts based on a title fragment
        result = ml.findArtifactsByName(dictIn['title'])
        pass
    elif "tag" in diKeysList:
        # Let's search for artifacts based on a tag
        result = ml.getArtifactsByTag(dictIn['tag'])
        pass
    elif "majtype" in diKeysList:
        # Let's search for artifacts based on a majtype
        result = ml.getArtifactsByMajtype(dictIn['majtype'])
        pass
    elif "relyear2" in diKeysList:
        # Let's search for artifacts based on a release year
        result = ml.getArtifactsByRelyear(dictIn['relyear1'],dictIn['relyear2'])
        pass
    elif "whereclause" in diKeysList:
        print("WHERE clause: " + dictIn['whereclause'])
        # Just a placeholder
        result = ml.getArtifactsByArbWhereClause(dictIn['whereclause'])
        pass
    else:
        result = ml.findArtifactsByName('')
        pass
    tmpRetObj['data'] = result;
    tmpRetObj['status']['success'] = True
    return json.dumps(tmpRetObj)

@app.route('/seriestidlist/get',methods=['POST'])
def getSeriesEpisodesTIDList():  # UPDATED FOR NEW RETURN OBJECT MODEL
    ml = MediaLibraryDB()
    dictIn = {}
    result = {}
    try:
        dictIn = yaml.safe_load(json.dumps(request.json))
        result = ml.getIdTitleListBySeriesArtiId(dictIn['artifactid'])
    except:
        dictIn = {}
        result = copy.deepcopy(ml.libMeta['retdicttempl'])
    pass    
    return json.dumps(result)

@app.route('/artifact/get',methods=['POST','GET'])
def getArtifactObj(): # UPDATED FOR NEW RETURN OBJECT MODEL
    dictIn = {}
    diKeysList = []
    reqJson = request.json
    try:
        dictIn = yaml.safe_load(json.dumps(request.json))
        diKeysList = list(dictIn.keys())
        assert "artifactid" in diKeysList
        assert type(dictIn['artifactid']) == type("string")
        assert 32 < len(dictIn['artifactid']) < 40
    except:
        print("What came in: " + request.json)
        dictIn = {}
        diKeysList = []
    pass
    ml = MediaLibraryDB()
    #artiDict = ml.getArtifactById(dictIn['artifactid']) # getArtifactByIdNew
    artiDict = ml.getArtifactByIdNew(dictIn['artifactid']) # getArtifactByIdNew
    return json.dumps(artiDict)

@app.route('/nextepisode/get',methods=['POST','GET'])
def getNxtEpArtifactObj(): # UPDATED FOR NEW RETURN OBJECT MODEL
    dictIn = {}
    diKeysList = []
    reqJson = request.json
    try:
        dictIn = yaml.safe_load(json.dumps(request.json))
        diKeysList = list(dictIn.keys())
        assert "artifactid" in diKeysList
        assert type(dictIn['artifactid']) == type("string")
        assert 32 < len(dictIn['artifactid']) < 40
    except:
        print("What came in: " + request.json)
        dictIn = {}
        diKeysList = []
    pass
    ml = MediaLibraryDB()
    artiDict = ml.getNextEpisodeArtifactById(dictIn['artifactid'])
    return json.dumps(artiDict)

###### DEPRECATED
# @app.route('/taglist/get',methods=['POST','GET'])
# def getTagList():
    # print('>>> HEY HEY HEY >>> getTagList <<<< HEY HEY HEY <<<')
    # ml = MediaLibraryDB()
    # return json.dumps(ml.getTagList())

@app.route('/suplist/get',methods=['POST','GET'])
def getSupportList(): # UPDATED FOR NEW RETURN OBJECT MODEL
    
    dictIn = {}
    diKeysList = []
    reqJson = request.json
    try:
        dictIn = yaml.safe_load(json.dumps(request.json))
        diKeysList = list(dictIn.keys())
        assert "table" in diKeysList
        assert type(dictIn['table']) == type("string")
        assert dictIn['table'] in ['persons','companies','tags']
        #assert len(dictIn['table']) > 3
    except:
        print("What came in: " + request.json)
        dictIn = {}
        diKeysList = []
    pass
    ml = MediaLibraryDB()
    artiDict = ml.getSupportList(dictIn['table'])
    return json.dumps(artiDict)
    
    # ml = MediaLibraryDB()
    # return json.dumps(ml.getTagList())
    pass

@app.route('/artifact/listfield/update',methods=['POST'])
def updateArtifactListField(): # UPDATED FOR NEW RETURN OBJECT MODEL
    dictIn = {}
    diKeysList = []
    reqJson = request.json
    try:
        dictIn = yaml.safe_load(json.dumps(request.json))
        diKeysList = list(dictIn.keys())
        assert "artifactid" in diKeysList
        assert type(dictIn['artifactid']) == type("string")
        assert 32 < len(dictIn['artifactid']) < 40
    except:
        print("What came in: " + request.json)
        dictIn = {}
        diKeysList = []
    pass
    ml = MediaLibraryDB()
    response = ml.artifactListFieldAction(reqJson)
    # print('updateArtifactListField - ' + json.dumps(reqJson))
    return json.dumps(response)

@app.route('/artifact/update',methods=['POST'])
def updateArtifact():  # UPDATED FOR NEW RETURN OBJECT MODEL
    dictIn = {}
    diKeysList = []
    reqJson = request.json
    try:
        dictIn = yaml.safe_load(json.dumps(request.json))
        diKeysList = list(dictIn.keys())
        assert "artifactid" in diKeysList
        assert type(dictIn['artifactid']) == type("string")
        assert 32 < len(dictIn['artifactid']) < 40
        
        assert 'values' in diKeysList
        assert type(dictIn['values']) == type({'key':'value'})
    except:
        print("What came in: " + request.json)
        dictIn = {}
        diKeysList = []
    pass
    ml = MediaLibraryDB()
    # print('updateArtifact: ' + json.dumps(dictIn))
    result = ml.modifyArtifact(dictIn['artifactid'],dictIn['values']) # sartifactIdIn,artifactDictIn)
    # print(result)
    return json.dumps(result)
    # artiDict = ml.getArtifactById(dictIn['artifactid'])
    # return json.dumps(artiDict)
    pass

@app.route('/artifact/newsingle',methods=['POST'])
def newSingleArtifact(): # UPDATED FOR NEW RETURN OBJECT MODEL
    dictIn = {}
    diKeysList = []
    reqJson = request.json
    try:
        dictIn = yaml.safe_load(json.dumps(request.json))
        diKeysList = list(dictIn.keys())
        assert "majtype" in diKeysList
        assert "file" in diKeysList
        assert "filepath" in diKeysList
        pass
    except:
        print("What came in: " + request.json)
        dictIn = {}
        diKeysList = []
    pass
    ml = MediaLibraryDB()  
    result = ml.apiCreateSingleArtifact(dictIn)
    # print(json.dumps(result))
    return json.dumps(result)
    pass
    
@app.route('/mfsearch/get',methods=['POST'])
def multiFactorSearch(): # UPDATED FOR NEW RETURN OBJECT MODEL 
    dictIn = {}
    diKeysList = []
    reqJson = request.json
    srchStr = ""
    try:
        dictIn = yaml.safe_load(json.dumps(request.json))
        diKeysList = list(dictIn.keys())
    except:
        print("What came in: " + str(request.json))
        dictIn = {}
        diKeysList = []
        return json.dumps([])
    ml = MediaLibraryDB()
    retobj = ml.getArtifactsByMultiFactorSrch(request.json)
    return json.dumps(retobj)
    pass

@app.route('/simpletxtsrch/get',methods=['POST','GET'])   ####  NEW NEW NEW  
def simpleTextSearch(): # UPDATED FOR NEW RETURN OBJECT MODEL
    print('BEGIN simpleTextSearch ====>>')
    dictIn = {}
    diKeysList = []
    reqJson = request.json
    srchStr = ""
    print(reqJson)
    try:
        dictIn = yaml.safe_load(json.dumps(request.json))
        diKeysList = list(dictIn.keys())
        assert "srchstr" in diKeysList
        assert type(dictIn['srchstr']) == type("string")
        assert 1 < len(dictIn['srchstr']) < 100
        print("simpleTextSearch GOT THROUGH THE ASSERTS!!")
        
        # assert 'values' in diKeysList
        # assert type(dictIn['values']) == type({'key':'value'})
    except:
        print("What came in: " + str(request.json))
        dictIn = {}
        diKeysList = []
        return json.dumps([])
    pass
    srchStr = str(dictIn['srchstr'])
    print(srchStr)
    
    #  getArtifactListByPersTitleStr
    ml = MediaLibraryDB()
    result = ml.findArtifactsBySrchStr(srchStr)
    return json.dumps(result)

@app.route('/series/artifacts/add',methods=['POST'])
def addArtisToSeries(): # UPDATED FOR NEW RETURN OBJECT MODEL
    #  addEpisodesToSeries(self,seriesArtiIdIn,filePathIn,fnFragIn)
    print('BEGIN addArtisToSeries ====>>')
    dictIn = {}
    diKeysList = []
    reqJson = request.json
    srchStr = ""
    print(reqJson)
    try:
        dictIn = yaml.safe_load(json.dumps(request.json))
        diKeysList = list(dictIn.keys())
    except:
        print("What came in: " + str(request.json))
        dictIn = {}
        diKeysList = []
        return json.dumps([])
    ml = MediaLibraryDB()
    retobj = ml.addEpisodesToSeries(dictIn['seriesaid'],dictIn['filepath'],dictIn['filefrag'])
    return json.dumps(retobj)
    pass
    
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Optional app description')
    # Switch
    parser.add_argument('--cli', action='store_true', help='A boolean switch')
    args = parser.parse_args()

    if (args.cli == True):
        mlc = MLCLI()
        mlc.mainLoop()
    else:
        app.run(host='0.0.0.0',port=5000)
    pass

