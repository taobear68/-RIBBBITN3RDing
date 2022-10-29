#!/usr/bin/python3


import pymysql
import uuid


class RMDBMaria:
    def __init__(self):
        self.dbc = {}
        self.dbc['host'] = 'localhost'
        self.dbc['user'] = 'vodlibapi'
        self.dbc['password'] = 'vodlibapipw'
        self.dbc['database'] = 'vodlib'
        
        self.keylists = {}
        self.keylists['artifact'] = ['artifactid','title','majtype','runmins','season','episode','file','filepath','director','writer','primcast','relorg','relyear','eidrid','imdbid','arbmeta']
        pass
    def _connect(self):
        dbc = pymysql.connect(host=self.dbc['host'],user=self.dbc['user'],password=self.dbc['password'],database=self.dbc['database'])
        return dbc
        pass
    def stdRead(self,sqlIn):
        data = None
        try:
            assert sqlIn.split(" ")[0].upper() == "SELECT"
            dbc = self._connect()
            cursor = dbc.cursor()
            #sqlStr = "SELECT * FROM artifacts WHERE artifactid = '4cf2d6f7-f887-4a82-9b06-022bd2a88f7d'"
            cursor.execute(sqlIn)
            data = cursor.fetchall()
            #print ("Database version : %s " % str(data))
            dbc.close()
        except:
            print("Poop")
        return data
    def stdUpdate(self,sqlIn):
        retval = None
        try:
            assert sqlIn.split(" ")[0].upper() == "UPDATE"
            print(sqlIn)

            dbc = self._connect()
            cursor = dbc.cursor()
            cursor.execute(sqlIn)
            dbc.commit()
            dbc.close()
            
            pass
        except:
            print("Poop")
            raise Exception("Update failed!")
        return retval
    def stdInsert(self,sqlIn):
        retval = None
        try:
            assert sqlIn.split(" ")[0].upper() == "INSERT"
            print(sqlIn)
            
            dbc = self._connect()
            cursor = dbc.cursor()
            cursor.execute(sqlIn)
            dbc.commit()
            dbc.close()
            
            pass
        except:
            print("Poop : " + sqlIn)
            #raise Exception("Insert failed!")
        return retval
    def stdDelete(self,sqlIn):
        retval = None
        try:
            assert sqlIn.split(" ")[0].upper() == "DELETE"
            print(sqlIn)
            
            dbc = self._connect()
            cursor = dbc.cursor()
            cursor.execute(sqlIn)
            dbc.commit()
            dbc.close()
            
            pass
        except:
            print("Poop")
            #raise Exception("Insert failed!")
        return retval

class RMCLI:
    def __init__(self):
        pass
    def askUntilValid(self,questionIn,valFuncIn):
        def autoTrue (valIn):
            return True
        pass
        if valFuncIn == None:
            valFuncIn = autoTrue
        pass
        valOK = False
        tmpVal = None
        while valOK == False:
            tmpVal = input(questionIn)
            try:
                valOK = valFuncIn(tmpVal)
            except:
                print("Validation function failed for Question '" + questionIn + "'")
                raise Exception('RMCLI.askUntilValid: Bad Validation Fucntion')
            pass
            try:
                assert type(valOK) == type(True)
            except:
                print("Validation function returned non-Boolean value for Question '" + questionIn + "'")
                raise Exception('RMCLI.askUntilValid: Bad Validation Fucntion Return Value')
        pass
        return tmpVal
    def askUntilInt(self,questionIn):
        def valInt (valIn):
            retval = False
            if str(int(valIn)) == valIn:
                retval = True
            return retval
        return self.askUntilValid(questionIn,valInt)
        
class RMVODSeriesBuilder:
    def __init__(self):
        self.db = RMDBMaria()
        pass
    def createSeriesContainerRecord(self):
        def autoTrue (valIn):
            return True
        def valMajtype (valIn):
            retval = False
            enumList = ['movie','tvseries','tvepisode']
            if valIn in enumList:
                retval = True
            return retval
        def valImdbId (valIn):
            retval = False
            retval = True
            return retval
        pass
        cli = RMCLI()
        # Ask title
        title = cli.askUntilValid("Enter Title: ",None)
        # Ask majtype
        majtype = cli.askUntilValid("Enter Majtype: ",valMajtype)
        # Ask runmins
        runmins = cli.askUntilInt("Enter Runmins: ")
        # Ask filepath
        filepath = cli.askUntilValid("Enter Filepath: ",None)
        # Ask relyear
        relyear = cli.askUntilInt("Enter Relyear: ")
        # Ask imdbid
        imdbid = cli.askUntilValid("Enter imdbid: ",valImdbId)
        # Generate UUID
        artiId = str(uuid.uuid4())
        
        insSql = 'INSERT INTO artifacts SET artifactid = "' + artiId + '", '
        insSql += 'title = "' + title + '", '
        insSql += 'majtype = "' + majtype + '", '
        insSql += 'runmins = "' + runmins + '", '
        insSql += 'season = -1, '
        insSql += 'episode = -1, '
        insSql += 'file = "", '
        insSql += 'filepath = "' + filepath + '", '
        insSql += 'director = \'["string"]\', '
        insSql += 'writer = \'["string"]\', '
        insSql += 'primcast = \'["string"]\', '
        insSql += 'relorg = \'["string"]\', '
        insSql += 'relyear = "' + relyear + '", '
        insSql += 'eidrid = "string", '
        insSql += 'imdbid = "' + imdbid + '", '
        insSql += 'arbmeta = \'{"string": "string"}\';'
        
        print(insSql)
        self.db.stdInsert(insSql)
        
        return artiId
    def linkEpisodes(self,seriesArtiIdIn):
        cli = RMCLI()
        etss = cli.askUntilValid("Enter Episode Title Search String",None)
        
        # Get this list of Episodes
        srchSql = 'SELECT artifactid FROM artifacts WHERE title LIKE "' + etss + '%" AND majtype = "tvepisode" ORDER BY title;'
        rowListTuple = self.db.stdRead(srchSql)
        print("Found " + str(len(rowListTuple)) + " episodes...")
        
        # Link the Episodes to the Series
        for rowTuple in rowListTuple:
            insSql = 'INSERT INTO s2e SET seriesaid = "' + seriesArtiIdIn + '", episodeaid = "' + rowTuple[0] +'"'
            self.db.stdInsert(insSql)
        pass
        
        # Tag the Series Artifact
        print("Tagging the Series Artifact...")
        selSql = "SELECT tag FROM t2a WHERE artifactid = '" + rowListTuple[0][0] + "'"
        rowListTuple = self.db.stdRead(selSql)
        for rowTuple in rowListTuple:
            print("Tag: " + rowTuple[0])
            insSql = "INSERT INTO t2a SET tag = '" + rowTuple[0] + "', artifactid = '" + seriesArtiIdIn + "'"
            self.db.stdInsert(insSql)
        pass
        return True
    def do(self):
        print("We're going to try to create a Series Artifact...")
        said = self.createSeriesContainerRecord()
        print("... and now, we're going to link Episode Artifacts to that Series.")
        self.linkEpisodes(said)
        print("Done.")
        
if __name__ == "__main__":
    sb = RMVODSeriesBuilder()
    sb.do()
        
