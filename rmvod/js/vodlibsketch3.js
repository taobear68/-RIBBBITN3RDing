
//vodlibsketch3.js  Copyright 2022 Paul Tourville

//This file is part of RIBBBITmedia VideoOnDemand (a.k.a. "rmvod").

//RIBBBITmedia VideoOnDemand (a.k.a. "rmvod") is free software: you 
//can redistribute it and/or modify it under the terms of the GNU 
//General Public License as published by the Free Software 
//Foundation, either version 3 of the License, or (at your option) 
//any later version.

//RIBBBITmedia VideoOnDemand (a.k.a. "rmvod") is distributed in the 
//hope that it will be useful, but WITHOUT ANY WARRANTY; without even 
//the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR 
//PURPOSE. See the GNU General Public License for more details.

//You should have received a copy of the GNU General Public License 
//along with RIBBBITmedia VideoOnDemand (a.k.a. "rmvod"). If not, 
//see <https://www.gnu.org/licenses/>.


class CookieCrisp {
    // This is an abstraction layer over cookie handling.
    constructor(){
        const jsonTemplZero = {'appName':'CookieCrisp','revNmbr':0,'recentPlays':[]};
        this.cookieJar = {'appName':'CookieCrisp','revNmbr':0,'recentPlays':'one,two,three'};
        this.template = {'appName':'CookieCrisp','revNmbr':0,'recentPlays':'one,two,three'};
        this.cExpDays = 90;
        this.maxRecentPlays = 100;
    }
    setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        let expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }    
    getCookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i <ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
    clearCookie(cname){
        //console.log("Clearing cookie " + cname);
        document.cookie = cname + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    initializeCookie(){
        var cookies = document.cookie.split(";");
    
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            var eqPos = cookie.indexOf("=");
            var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        var tkList = Object.keys(this.template);
        for (var idx = 0; idx < tkList.length; idx++ ) {
            this.setCookie(tkList[idx],this.template[tkList[idx]], this.cExpDays);
        }
    }
    extantCookieCheck(){
        var retval = false
        try{
            var anStr = this.getCookie('appName');
            if (anStr != this.template['appName']) {
                //console.log("Cookie key appName not found.  Initializing cookies.");
                throw("Cookie key appName not found.  Initializing cookies.");
            }
            //console.log("Cookie key appName found.");
            retval = true;
        } catch (e) {
            this.initializeCookie();
        }
        return retval;
    }
    addRecentPlay(artiIdIn){
        //console.log("CookieCrisp.addRecentPlay - Trying to add recent play for AID: " + artiIdIn);
        var cStr = this.getCookie('recentPlays');
        var rpList = [];
        if (cStr.length > 1) {
            rpList = cStr.split(',');
        }
        //console.log('CookieCrisp.addRecentPlay - List length: ' + rpList.length);
        if (rpList.indexOf(artiIdIn) < 0) {
            //console.log('CookieCrisp.addRecentPlay - Artifact ' + artiIdIn + ' not found in the Recent Plays list.');
            rpList.push(artiIdIn);
            //console.log('CookieCrisp.addRecentPlay - recentPlays: ' + JSON.stringify(rpList));
            while (rpList.length > this.maxRecentPlays) {
                //console.log("CookieCrisp.addRecentPlay - deleting a recent play " + rpList[0]);
                rpList.splice(0,1);
            }
        }
        var newCStr = '';
        for (var idx = 0; idx < rpList.length; idx++ ) {
            newCStr += rpList[idx];
            if (idx < (rpList.length - 1)) {
                newCStr += ',';
            } 
        }
        //console.log('addRecentPlay DONE: ' + newCStr);
        //console.log("CookieCrisp.addRecentPlay - Updated recentPlays cookie: " + newCStr);
        this.setCookie('recentPlays',newCStr,this.cExpDays);
        //var talkback = this.getCookie('recentPlays');
        //if (talkback == newCStr) {
            //console.log("CookieCrisp.addRecentPlay - Confirmed write SUCCEEDED.");
        //} else {
            //console.log("CookieCrisp.addRecentPlay - Confirmed write FAILED!");
        //}
    }
}

class RMVodWebApp {
    constructor(){
        this.logUtil = new RMLogUtil('RMPCWebApp',3);
        this.sse = new RMSSSEnhanced();
        this.api = new RMAPI();
        this.sut = new RMSessionUtil();
        this.cc = new CookieCrisp();
        this.cc.extantCookieCheck();
    }
    initStorage(){
        var sstorTemplObj = [];
        sstorTemplObj.push({'name':'blob','type':'dict','content':'{}'}); // Tree Metadata
        
        sstorTemplObj.push({'name':'titleidlist','type':'list','content':'[]'}); // Tree Metadata
        
        sstorTemplObj.push({'name':'localcfg','type':'dict','content':'{}'}); // Tree Metadata
        sstorTemplObj.push({'name':'refdata','type':'dict','content':{}});
        sstorTemplObj.push({'name':'filterdata','type':'dict','content':{}});
        sstorTemplObj.push({'name':'sortdata','type':'dict','content':{}});
        sstorTemplObj.push({'name':'indexdata','type':'dict','content':{}});
        this.sse.sstorInit(sstorTemplObj);
        
        var libDict = {};
        libDict['n2a'] = {};
        libDict['artifacts'] = {};
        libDict['tags'] = [];
        libDict['a2t'] = {};
        libDict['t2a'] = {};
        libDict['series'] = [];
        libDict['persons'] = [];
        libDict['companies'] = [];
        
        this.sse.ssWrite('blob',libDict);
        
        this.sse.ssOKWrite('localcfg','dirtycheckinterval',500); // freshcheckinterval
        this.sse.ssOKWrite('localcfg','freshcheckinterval',1000); // freshcheckinterval
        this.sse.ssOKWrite('localcfg','apibaseuri','/freezer/api/');       // API Base URI
        this.sse.ssOKWrite('localcfg','apiepblobget','blob/get');    // API Endpoint - Single Object Fetch
        
        this.apiFetchPersonsList();
        this.apiFetchCompaniesList();
        this.apiFetchTagsList();
        
        // These version bits will eventually need to involve polling 
        // the API and DB for their versions
        this.apiFetchRemoteVersions();
        //this.postCSSVer("0.2.0");
        this.postJSVer("0.3.8");
        //this.env = {};
        //this.env.versions. = {};
        //this.env.versions.api = "undetermined";
        //this.env.versions.db = "undetermined";
        //this.env.versions.html = "undetermined";
        //this.env.versions.css = "undetermined";
        //this.env.versions.js = "0.3.7";
        
    }
    postCSSVer(verStrIn){
        
        // CSS file should contain a line like this:
        // /* vodlib.css version 0.2.0 */
        // which we should parse for just the "0.2.0" portion
        
        console.log("postCSSVer: " + verStrIn);
        document.getElementById("version_css").innerText = "css version: " + verStrIn;
    }
    postJSVer(verStrIn){
        console.log("postJSVer: " + verStrIn);
        document.getElementById("version_js").innerText = "js version: " + verStrIn;
    }
    postDBVer(verStrIn){
        // "version_db"
        console.log("postDBVer: " + verStrIn);
        document.getElementById("version_db").innerText = "db version: " + verStrIn;
    }
    postAPIVer(verStrIn){
        console.log("postAPIVer: " + verStrIn);
        document.getElementById("version_api").innerText = "api version: " + verStrIn;
    }
    postHTMLVer(verStrIn){
        console.log("postHTMLVer: " + verStrIn);
        document.getElementById("version_html").innerText = "html version: " + verStrIn;
    }
    clockSet() {
        
        var gtFunc = function () {
            var dObj = new Date();
            var yr = dObj.getFullYear();
            var mo = dObj.getMonth() + 1;
            var dy = dObj.getDate();
            var hr = dObj.getHours();
            var mn = dObj.getMinutes();
            var sc = dObj.getSeconds();
            var moStr = mo.toString();
            if (mo < 10) {
                moStr = "0" + mo.toString();
            }
            var dyStr = dy.toString();
            if (dy < 10) {
                dyStr = "0" + dy.toString();
            }
            var hrStr = hr.toString();
            if (hr < 10) {
                hrStr = "0" + hr.toString();
            }
            var mnStr = mn.toString();
            if (mn < 10) {
                mnStr = "0" + mn.toString();
            }
            var scStr = sc.toString();
            if (sc < 10) {
                scStr = "0" + sc.toString();
            }
            var dateStr = yr.toString() + '-' + moStr + '-' + dyStr;
            //var timeStr = hrStr + ':' + mnStr + ':' + scStr;
            var timeStr = hrStr + ':' + mnStr // + ':' + scStr;
            var datTimStr = dateStr + ' ' + timeStr; // yr.toString() + '-' + moStr + '-' + dyStr + ' ' + hrStr + ':' + mnStr + ':' + scStr;
            //var datTimStr = yr.toString() + '-' + moStr + '-' + dyStr + ' ' + hrStr + ':' + mnStr + ':' + scStr;
            //console.log(datTimStr);
            document.getElementById('headerblock3').innerHTML = '<div><b>' + datTimStr + '</b></div>';
        }
        gtFunc();
        var intv = setInterval(gtFunc,15000);
        console.log("Interval: " + intv);
        
    }
    apiFetchRemoteVersions(){
        console.log("This is where we get API and DB versions");
        var cbFunc = function (objIn) {
            console.log('apiFetchRemoteVersions: ' + JSON.stringify(objIn));
            var wa = new RMVodWebApp();
            wa.postHTMLVer(objIn['html_version']);
            wa.postDBVer(objIn['db_version']);
            wa.postAPIVer(objIn['api_version']);
            wa.postCSSVer(objIn['css_version']);
        }
        const payloadObj = {};
        const endpoint = '/rmvid/api/apiversion/get';
        var result = this.genericApiCall(payloadObj,endpoint,cbFunc);
        
    }
    apiFetchRemoteVersions2(){  //someday
        //console.log("This is where we get API and DB versions");
        //var cbFunc = function (objIn) {
            //console.log('apiFetchRemoteVersions: ' + JSON.stringify(objIn));
            //var wa = new RMVodWebApp();
            
            //wa.env.versions.api = objIn['api_version'];
            //wa.env.versions.db = objIn['db_version'];
            //wa.env.versions.html = objIn['html_version'];
            //wa.env.versions.css = objIn['css_version'];
            
            
            //wa.postHTMLVer(objIn['html_version']);
            //wa.postDBVer(objIn['db_version']);
            //wa.postAPIVer(objIn['api_version']);
            //wa.postCSSVer(objIn['css_version']);
        //}
        //const payloadObj = {};
        //const endpoint = '/rmvid/api/apiversion/get';
        //var result = this.genericApiCall(payloadObj,endpoint,cbFunc);
        
    }
    apiFetchPersonsList(){
        var cbFunc = function (dataObjIn) {
            // Write to Session Store
            var sse = new RMSSSEnhanced();
            var theBlob = sse.ssRead('blob');
            theBlob['persons'] = dataObjIn;
            sse.ssWrite('blob',theBlob);
        }
        const payloadObj = {'table':'persons'};
        const endpoint = '/rmvid/api/suplist/get';
        var result = this.genericApiCall(payloadObj,endpoint,cbFunc);
    }
    apiFetchCompaniesList(){
        var cbFunc = function (dataObjIn) {
            // Write to Session Store
            var sse = new RMSSSEnhanced();
            var theBlob = sse.ssRead('blob');
            theBlob['companies'] = dataObjIn;
            sse.ssWrite('blob',theBlob);
        }
        const payloadObj = {'table':'companies'};
        const endpoint = '/rmvid/api/suplist/get';
        var result = this.genericApiCall(payloadObj,endpoint,cbFunc);
    }
    apiFetchTagsList(){
        var cbFunc = function (dataObjIn) {
            // Write to Session Store
            var sse = new RMSSSEnhanced();
            var theBlob = sse.ssRead('blob');
            theBlob['tags'] = dataObjIn;
            sse.ssWrite('blob',theBlob);
        }
        const payloadObj = {'table':'tags'};
        const endpoint = '/rmvid/api/suplist/get';
        var result = this.genericApiCall(payloadObj,endpoint,cbFunc);
    }
    renderTitleDiv(){
        //titletop
        
        var tmpHtml = '';
        tmpHtml += '<div style="width:690px;height:50px;">'
        tmpHtml += '<div style="display:inline-flex;">';
        tmpHtml += '  <div style="display:inline-flex; width:225px;">';
        tmpHtml += '    <div style="display:inline-flex;width:100%">';
        tmpHtml += '      <div>';
        tmpHtml += '        <div style="display:block;">';
        tmpHtml += '          <b><a href="/index.html">RIBBBITVOD!</a></b>';
        tmpHtml += '        </div>';
        tmpHtml += '        <div id="playback-title-div" style="display:block;">';
        tmpHtml += '          &nbsp;';
        tmpHtml += '        </div>';
        tmpHtml += '      </div>';
        tmpHtml += '    </div>';
        tmpHtml += '  </div>';
        tmpHtml += '  <div style="display:inline-flex; width:225px;">';
        tmpHtml += '    <div id="simple-search-div">';
        tmpHtml += '      &nbsp; I can haz search?';
        tmpHtml += '    </div>';
        tmpHtml += '  </div>';
        tmpHtml += '  <div style="display:inline-flex; width:225px;">';
        tmpHtml += '    <div id="aux-header-div">';
        tmpHtml += '      &nbsp; Post no bills';
        tmpHtml += '    </div>';
        tmpHtml += '  </div>';
        tmpHtml += '</div>';
        tmpHtml += '</div>';
        //tmpHtml += '';
        
        try {
            document.getElementById('titletop').innerHTML = tmpHtml;
        } catch (e) {
            console.log('titletop not available yet. ' + e);
        }
        
        //this.renderSimpleSearchWidget();
        this.renderStaticModernSearchWidget();
    }
    genericApiCall(payloadObjIn,endpointIn,cbFuncIn){
        /*
         * payloadeObjIn must minimally be {}
         * 
         * endpointIn should be the full path to the endpoint
         * 
         * cbFuncIn should accept one argument, which would be the 
         * JSON.parse of the responseText
         * 
         * */
        var contentRet ={};
        const apiEndpoint = endpointIn;
        const payload = payloadObjIn;
        const bodyDataStr = JSON.stringify(payload);
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            var sse = new RMSSSEnhanced();
            var responseObj = {}
            if (this.readyState == this.DONE) {
                if (this.onreadystatechange) {
                    if (([200,201,202].indexOf(this.status) > -1)) {
                        xhttp.onreadystatechange = null;
                        var fetchObj =  JSON.parse(this.responseText);
                        if ((typeof cbFuncIn) == "function") {
                            cbFuncIn(fetchObj);
                        }
                    }
                }
            }
        }
        xhttp.open("POST", apiEndpoint, true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(bodyDataStr);
        return contentRet;
    }
    vodlibtaglistget (cbFuncIn) {
        // /artifact/get
        var contentRet ={};
        const apiEndpoint = '/rmvid/api/taglist/get'; 
        const payload = {};
        const bodyDataStr = JSON.stringify(payload);
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            var sse = new RMSSSEnhanced();
            var responseObj = {}
            if (this.readyState == this.DONE) {
                if (this.onreadystatechange) {
                    if (([200,201,202].indexOf(this.status) > -1)) {
                        xhttp.onreadystatechange = null;
                        var tagsList = JSON.parse(this.responseText);
                        var theBlob = sse.ssRead('blob');
                        theBlob['tags'] = tagsList;
                        sse.ssWrite('blob',theBlob);
                        if ((typeof cbFuncIn) == "function") {
                            cbFuncIn();
                        }
                    }
                }
            }
        }
        xhttp.open("POST", apiEndpoint, true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(bodyDataStr); // bodyDataStr
        return contentRet;
    }
    vodlibartiobjget (artiIdIn,cbFuncIn) {
        var contentRet ={};
        const apiEndpoint = '/rmvid/api/artifact/get'; 
        const payload = {'artifactid':artiIdIn};
        const bodyDataStr = JSON.stringify(payload);
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            var sse = new RMSSSEnhanced();
            var responseObj = {}
            if (this.readyState == this.DONE) {
                if (this.onreadystatechange) {
                    if (([200,201,202].indexOf(this.status) > -1)) {
                        xhttp.onreadystatechange = null;
                        var artiObj = JSON.parse(this.responseText);
                        var artiObjId = artiObj['artifactid'];
                        var theBlob = sse.ssRead('blob');
                        theBlob['artifacts'][artiObjId] = artiObj;
                        sse.ssWrite('blob',theBlob);
                        if ((typeof cbFuncIn) == "function") {
                            cbFuncIn();
                        }
                    }
                }
            }
        }
        xhttp.open("POST", apiEndpoint, true);
        xhttp.setRequestHeader("Content-type", "application/json");
        //xhttp.send({}); // bodyDataStr
        xhttp.send(bodyDataStr); // bodyDataStr
        return contentRet;
    }
    vodlibartilistget (cbFuncIn) {
        var contentRet ={};
        const apiEndpoint = '/rmvid/api/titleidlist/get'; 
        const bodyDataStr = JSON.stringify({});
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            var sse = new RMSSSEnhanced();
            var responseObj = {}
            if (this.readyState == this.DONE) {
                if (this.onreadystatechange) {
                    if (([200,201,202].indexOf(this.status) > -1)) {
                        xhttp.onreadystatechange = null;
                        sse.ssWrite('titleidlist',JSON.parse(this.responseText));
                        if ((typeof cbFuncIn) == "function") {
                            cbFuncIn();
                        }
                    }
                }
            }
        }
        xhttp.open("POST", apiEndpoint, true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send({});
        return contentRet;
    }  // /api/get/titleidlist
    vodlibqdget (cbFuncIn) {
        var contentRet ={};
        const apiEndpoint = '/rmvid/api/blob/get'; 
        const bodyDataStr = JSON.stringify({});
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            var sse = new RMSSSEnhanced();
            var responseObj = {}
            if (this.readyState == this.DONE) {
                if (this.onreadystatechange) {
                    if (([200,201,202].indexOf(this.status) > -1)) {
                        xhttp.onreadystatechange = null;
                        sse.ssWrite('blob',JSON.parse(this.responseText));
                        if ((typeof cbFuncIn) == "function") {
                            cbFuncIn();
                        }
                    }
                }
            }
        }
        xhttp.open("POST", apiEndpoint, true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send({});
        return contentRet;
    }  // /api/get/titleidlist
    vodPlayTitleApi2(artiIdIn){
        var cbFunc = function () {
            var wa = new RMVodWebApp()
            // Set cookie for "resume playback" artifact id
            wa.cc.setCookie('playing_aid',artiIdIn,365);
            
            try {
                const tmpIntvHandle = this.cc.getCookie('cont_play_sample_int_handle');
                //console.log("Looks like we have a left-over interval: " + tmpIntvHandle + ".  Clearing it");
                clearInterval(tmpIntvHandle);
                //console.log("Interval cleared.  Clearing the cookie now.");
                this.cc.clearCookie('cont_play_sample_int_handle');
                //console.log("Done.");
            } catch (e) {
                console.log("Attempt to clear left-over interval failed.");
            }
            
            
            var artiObj = wa.sse.ssRead('blob')['artifacts'][artiIdIn];
            var artiDir = artiObj['filepath'];
            var artiFil = artiObj['file'];
            var playerAR = 1.7778;
            var playerHeight = 500;
            var playerWidth = parseInt(playerHeight * playerAR);
            
            var srcURI = '/rmvid/vidsrc/' + artiDir + '/' + artiFil ;
            
            
            var playerHTML = '';
            //playerHTML += '<div style="width:660px;height:360px;vertical-align:center;horizontal-align:center;margin:20px;">';
            playerHTML += '<div style="width:1100px;height:500px;vertical-align:top;horizontal-align:center;">';
            //playerHTML += '<video id="actualvideoplayer" width=' + playerWidth.toString() + ' height=' + playerHeight.toString() + ' style="vertical-align:top;horizontal-align:center;" autoplay=true controls=true>';
            playerHTML += '<video id="actualvideoplayer" width=1100 height=500 style="vertical-align:top;horizontal-align:center;" autoplay=true controls=true>';
            // playerHTML += '<source src="/rmvid/vidsrc/' + artiDir + '/' + artiFil + '" type="video/mp4">' ;
            playerHTML += '<source src="' + srcURI + '" type="video/mp4">' ;
            playerHTML += 'Your browser does not support the video tag';
            playerHTML += '</video>';
            playerHTML += "</div>";
            
            document.getElementById('structfeatureplayer').innerHTML = playerHTML;
            
            var avpDE = document.getElementById('actualvideoplayer');
            avpDE.addEventListener('ended', (event) => {pbEnded(artiIdIn)});
            
            var currSrc = avpDE.currentSrc;
            //console.log('currSrc: ' + currSrc);
            
            // wa.cc.setCookie('artifact_source_uri',document.getElementById('actualvideoplayer').currentSrc,5);
            wa.cc.setCookie('artifact_source_uri',currSrc,5);
            
            document.getElementById('tabspan0').click();
            
            //  HEY HEY HEY  >>>>
            // THIS NEEDS TO BE REWORKED FOR THE NEW "CINEMATIC VIEW" THING
            var newContentDiv = wa.renderArtifactDetailApi(artiIdIn);
            //  HEY HEY HEY  ^^^^^^^^
            
            
            //console.log('vodPlayTitleApi2.cbFunc - artifact_source_uri: ' + wa.cc.getCookie('artifact_source_uri'));
            
            try {
                wa.contCookiePostInterval(60000);
            } catch (e) {
                console.log('vodPlayTitleApi2 cbFunc barfed on trying wa.contCookiePostInterval(60000): ' + e);
            }
        }
        
        //console.log("Trying to add " + artiIdIn + " to the Recent Plays cookie.");
        this.cc.addRecentPlay(artiIdIn);
        //console.log("Done adding " + artiIdIn + " to the Recent Plays cookie.");
        
        try {
            // this.cc.addRecentPlay(artiIdIn);
            const listTitleSpanId = artiIdIn + '_list-title-span';
            document.getElementById(listTitleSpanId).className = 'listtitleseen';
        } catch (e) {
            console.log('vodPlayTitleApi2 - Setting the classname for the artifact failed');
        }
        this.vodlibartiobjget(artiIdIn,cbFunc);
    }
    vodPlayNextTitle(artiIdIn){
        //// Confirm checkbox is checked
        if (document.getElementById('serplaynext').checked == false) {
            console.log('serplaynext not checked');
            return;
        }
        var cbFunc = function(objIn){
            var wa = new RMVodWebApp();
            wa.vodPlayTitleApi2(objIn['artifactid']);
        }
        const payloadObj = {'artifactid':artiIdIn};
        const endpoint = '/rmvid/api/nextepisode/get';
        this.genericApiCall(payloadObj,endpoint,cbFunc);
    }
    srchSpan(strIn) {
        // Takes a simple string in, and wraps it in a span with onclick
        // set to do execDirectStringSrch in the switchboard
        var retStr = '';
        retStr += '<span onclick="switchboard(\'execDirectStringSrch\',\'\',{\'srchstr\':\'';
        retStr += strIn;
        retStr += '\'})" style="text-decoration:underline;">';
        retStr += strIn;
        retStr += '</span>'
        return retStr;
    }
    l2s(arrayIn){
        // This just turns an Array object into a String list with 
        // commas between the elements.
        var listStr = '';
        var aLen = arrayIn.length;
        for (var i = 0; i < aLen; i++) {
            listStr += arrayIn[i];
            //listStr += srchSpan(arrayIn[i]);
            if (i < (aLen - 1)) {
                listStr += ', ';
            }
        }
        return listStr
    }
    l2sSrch(arrayIn){
        // This just turns an Array object into a String list with 
        // commas between the elements.
        
        var plainValList = ['string','none',''];
        var listStr = '';
        var aLen = arrayIn.length;
        for (var i = 0; i < aLen; i++) {
            //listStr += arrayIn[i];
            if (plainValList.indexOf(arrayIn[i]) == -1) {
                listStr += this.srchSpan(arrayIn[i]);
            } else {
                listStr += arrayIn[i];
            }
            if (i < (aLen - 1)) {
                listStr += ', ';
            }
        }
        return listStr
    }
    onloadOptions(){
        // serplaynext
        // resumeplay
        
        var optList = ['serplaynext','resumeplay'];
        
        for (var idx=0; idx < optList.length; idx++ ) {
            var optNm = optList[idx];
            var tmpCookie = this.cc.getCookie('opt_' + optNm);
            var cbDE = document.getElementById(optNm);
            console.log('onloadOptions: ' + optNm + ' - ' + document.getElementById(optNm).name + ' -  ' + cbDE.checked );
            switch (tmpCookie) {
                case true:
                case 'true':
                    cbDE.checked = true;
                    break;
                case false:
                case "false":
                    cbDE.checked = false;
                    break;
                default:
                    console.log('onloadOptions - No cookie value for ' + optNm);
                    cbDE.checked = false;
                    break;
            }
            var tmpFunc = function(){switchboard('checkboxChange',this.id ,{});}
            
            cbDE.addEventListener("change", tmpFunc);
            
        }
    }
    renderStaticModernSearchWidget(){
        // Search Modes: Simple (Single Factor - exec. on change), Complex (Multiple Factor - exec. on button click)
        //
        // Factors:
        //   Search By Tag (select list)
        //   Search by String (title, persons)
        //   Search by Release Year range
        //   Search with arbitrary SQL WHERE Clause
        
        var factorDivWidth = "470px";
        var factorDivMargin = "10px";
        var factorTitleDivWidth = "150px";
        
        var newSrchWidget = document.createElement('div');
        newSrchWidget.style.margin = "8px";
        
        var mfPicker = document.createElement('div');
        mfPicker.innerHTML = 'Multi-Factor Search:&nbsp;<input name="mfsearchyn"  id="mfsearchyn" type="checkbox">';
        
        newSrchWidget.appendChild(mfPicker);

        var lastContainer = document.createElement('div');
        lastContainer.innerHTML = 'Search Factors:<br>';

        //   Search By Tag (select list)
        var sfdTag = document.createElement('div');
        sfdTag.style.margin = factorDivMargin;
        sfdTag.style.width = factorDivWidth;
        var dTitle = document.createElement('div');
        dTitle.innerHTML = "Tag:";
        dTitle.style.display = "inline-flex";
        dTitle.style.width = factorTitleDivWidth;
        var dCont = document.createElement('div');
        dCont.style.display= "inline-flex";
        dCont.innerHTML = '<select style="font-family:arial;font-size:18px;" id="tag-search-select" name="tag-search-select" onchange="switchboard(\'execTagSearch\',\'tag-search-select\',{})"><option value="">None</option></select>';
        sfdTag.appendChild(dTitle);
        sfdTag.appendChild(dCont);
        
        lastContainer.appendChild(sfdTag);
        
        
        // Search by string
        var sfdString = document.createElement('div');
        sfdString.style.margin = factorDivMargin;
        sfdString.style.width = factorDivWidth;
        var dTitle = document.createElement('div');
        dTitle.innerHTML = "String:";
        dTitle.style.display = "inline-flex";
        dTitle.style.width = factorTitleDivWidth;
        var dCont = document.createElement('div');
        dCont.style.display= "inline-flex";
        dCont.innerHTML = '<input id="txt-srch-str" type="text" size="15" onchange="switchboard(\'execTxtSrch\',\'txt-srch-str\',{})">';
        sfdString.appendChild(dTitle);
        sfdString.appendChild(dCont);
        
        lastContainer.appendChild(sfdString);
        

        //   Search By MajType (select list)
        var sfdTag = document.createElement('div');
        sfdTag.style.margin = factorDivMargin;
        sfdTag.style.width = factorDivWidth;
        var dTitle = document.createElement('div');
        dTitle.innerHTML = "Major Type:";
        dTitle.style.display = "inline-flex";
        dTitle.style.width = factorTitleDivWidth;
        var dCont = document.createElement('div');
        dCont.style.display= "inline-flex";
        // var tmpHtml = '<select style="font-family:arial;font-size:18px;" id="majtype-search-select" name="majtype-search-select" onchange="switchboard(\'execMajTypSearch\',\'majtype-search-select\',{})">';
        var tmpHtml = '<select style="font-family:arial;font-size:18px;" id="majtype-search-select" name="majtype-search-select" onchange="switchboard(\'execMajTypSrch\',this.id,{})">';
        tmpHtml += '<option value="">All</option>';
        tmpHtml += '<option value="movie">Movies</option>';
        tmpHtml += '<option value="tvseries">TV Series</option>';
        tmpHtml += '</select>';
        
        dCont.innerHTML = tmpHtml;
        sfdTag.appendChild(dTitle);
        sfdTag.appendChild(dCont);
        
        lastContainer.appendChild(sfdTag);
        
        
        // Search by release year range

        var sfdRelYr = document.createElement('div');
        sfdRelYr.style.margin = factorDivMargin;
        sfdRelYr.style.width = factorDivWidth;
        var dTitle = document.createElement('div');
        dTitle.innerHTML = "Release Year Range:";
        dTitle.style.display = "inline-flex";
        dTitle.style.width = factorTitleDivWidth;
        var dCont = document.createElement('div');
        dCont.style.display= "inline-flex";
        // var tmpHtml = 'Start:&nbsp;<input id="relyear-srch-start" type="text" size="5" onchange="switchboard(\'\',this.id,{})">';
        var tmpHtml = 'Start:&nbsp;<input id="relyear-srch-start" type="text" size="5" >'; // onchange="switchboard(\'\',this.id,{})"
        tmpHtml += '&nbsp;-&nbsp;';
        tmpHtml += 'End:&nbsp;<input id="relyear-srch-end" type="text" size="5" onchange="switchboard(\'execRelyearSrch\',this.id,{})">';
        dCont.innerHTML = tmpHtml;
        sfdRelYr.appendChild(dTitle);
        sfdRelYr.appendChild(dCont);
        
        lastContainer.appendChild(sfdRelYr);
        
        
        // Search by SQL WHERE Clause
        var sfdSqlWhere = document.createElement('div');
        sfdSqlWhere.style.margin = factorDivMargin;
        sfdSqlWhere.style.width = factorDivWidth;
        var dTitle = document.createElement('div');
        dTitle.innerHTML = "SQL WHERE Clause:";
        dTitle.style.display = "inline-flex";
        dTitle.style.width = factorTitleDivWidth;
        var dCont = document.createElement('div');
        dCont.style.display= "inline-flex";
        var tmpHtml = '<textarea id="sql-where-srch" name="sql-where-srch" rows="5" cols="30" onchange="switchboard(\'execWhereClauseSrch\',this.id,{})"></textarea>';
        dCont.innerHTML = tmpHtml;
        sfdSqlWhere.appendChild(dTitle);
        sfdSqlWhere.appendChild(dCont);
        
        lastContainer.appendChild(sfdSqlWhere);
        
        
        newSrchWidget.appendChild(lastContainer);
        
        var targDiv = document.getElementById('headerblock2');
        targDiv.innerHTML = '';
        targDiv.appendChild(newSrchWidget);
        
        this.tagSelListRefresh();
    }
    tagSelListRefresh(){
        var tsl = document.getElementById('tag-search-select');
        // Clear the current list of options
        while (tsl.length > 0) {
            tsl.remove(0);
        }
        // Add "None" option back
        var noneOpt = document.createElement('option');
        noneOpt.value = '';
        noneOpt.innerHTML = 'None';
        tsl.appendChild(noneOpt);
        // Fetch Tags from API and repopulate
        
        var cbFunc = function (objIn) {
            var tsl = document.getElementById('tag-search-select');
            var lLen = objIn.length;
            if ( lLen > 0 ) {
                for (var i = 0; i < lLen; i++ ){
                    var opt = document.createElement('option');
                    opt.value = objIn[i];
                    opt.innerHTML = objIn[i];
                    tsl.appendChild(opt);
                }
            }
        }
        const endpoint = '/rmvid/api/taglist/get';
        const payload = {};
        this.genericApiCall(payload,endpoint,cbFunc);
    }
    execAdvancedSearch(){
        var titleFrag = document.getElementById('advsrchtitlefrag').value
        console.log('execAdvancedSearch: ' + titleFrag);
        
        document.getElementById('div01').innerHTML = '';

        var theBlob = this.sse.ssRead('blob');
        var artiIdList = [];
        var srcArtiIdList = Object.keys(theBlob['artifacts']);
        for (var idx=0; idx<srcArtiIdList.length; idx++ ) {
            var thisArtiTitle = theBlob['artifacts'][srcArtiIdList[idx]]['title'].toLowerCase();
            var thisTitleCmp = thisArtiTitle.toLowerCase();
            var titleFragCmp = titleFrag.toLowerCase();
            if (thisTitleCmp.includes(titleFragCmp)) {
                artiIdList.push(srcArtiIdList[idx]);
            }
        }
        
        console.log(JSON.stringify(artiIdList));
        
        var listDiv = this.renderArtifactBlocksByIdList(artiIdList);
        document.getElementById('div01').appendChild(listDiv);
        
        //Clear and hide Advanced Search block
        document.getElementById('big-search-container').innerHTML = '';
        document.getElementById('big-search-container').style.display = 'none';
    }
    renderAdvSearch(){
        console.log('renderAdvSearch');
        var tmpHtml = `
<div>
  <div style="display:block;"> <!-- row 1 -->
    <div style="display:inline-flex;">
      <div style="display:inline-flex;width:100px;">Title</div>
      <div style="display:inline-flex;width:300px;"><input type="text" name="advsrchtitlefrag" id="advsrchtitlefrag"></div>
    </div>
  </div>
  
  <div style="display:block;"> <!-- row 2 -->
    <div style="display:inline-flex;">
      <div style="display:inline-flex;width:100px;">label</div>
      <div style="display:inline-flex;width:300px;">field</div>
    </div>
  </div>
  <div style="display:block;"> <!-- row 3 -->
    <div style="display:inline-flex;">
      <div style="display:inline-flex;width:100px;">label</div>
      <div style="display:inline-flex;width:300px;">field</div>
    </div>
  </div>
  
  <div style="display:block;"> <!-- last row  -->
    <div style="display:inline-flex;">
      <div style="display:inline-flex;width:300px;">&nbsp;</div>
      <div style="display:inline-flex;width:100px;">
        <span onclick="switchboard(\'execAdvSrch\',\'\',{})"><b><u>Search</u></b></span>
      </div>
    </div>
  </div>
</div>
`
        document.getElementById('big-search-container').innerHTML = tmpHtml;
        // Put it in this div:  big-search-container
    }
    // Major Page Parts
    docElRenderHeaderFourCell(){  // <<=== DEPRECATED
        // Header
        var headerOuterDiv = document.createElement('div');
        headerOuterDiv.className = "headercont";
        headerOuterDiv.id = "headercont";
        
        var cell1OuterDiv1 = document.createElement('div');
        cell1OuterDiv1.className = "headerflexcell";
        cell1OuterDiv1.id = "headerblock1";
        cell1OuterDiv1.innerHTML = '<div><a href="./vodlib_static_2.html"><img src="./img/rmvod_badge_center.png" height="75" width="75" style="height:75px;width:75px;"></a></div>';
        
        var cell1OuterDiv2 = document.createElement('div');
        cell1OuterDiv2.className = "headerflexcell";
        cell1OuterDiv2.id = "headerblock2";
        
        var cellTwoStr = "";
        cellTwoStr += '<div class="" id="" style="display:block;">';
        
        cellTwoStr += '<div class="" id="" style="display:block;"><!-- SEARCH BY TAG -->';
        cellTwoStr += '<b>Filter by tag:</b><br>';
        cellTwoStr += '<select id="tag-search-select" name="tag-search-select" onchange="switchboard(\'execTagSearch\',\'tag-search-select\',{})">';
        cellTwoStr += '</select>';
        cellTwoStr += '</div>';
        
        cellTwoStr += '<div class="" id="" style="display:block;"><!-- SEARCH BY TITLE -->';
        cellTwoStr += '<b>Seach by Title:</b><br>';
        cellTwoStr += '<input type="text" id="" class="" style="width:150px;">';
        cellTwoStr += '</div>';
        
        cellTwoStr += '<div class="" id="" style="display:block;"><!-- SEARCH BY TITLE -->';
        cellTwoStr += '<b>Seach by Title:</b><br>';
        cellTwoStr += '<input type="text" id="" class="" style="width:150px;">';
        cellTwoStr += '</div>';
        
        cellTwoStr += '<div class="" id="" style="display:block;">';
        cellTwoStr += '<span class="" id="" style="">';
        cellTwoStr += '<u>Advanced Search</u>';
        cellTwoStr += '</span>';
        cellTwoStr += '</div>';
        
        cellTwoStr += '</div>';
        
        cell1OuterDiv2.innerHTML = cellTwoStr;

        var cell1OuterDiv3 = document.createElement('div');
        cell1OuterDiv3.className = "headerflexcell";
        cell1OuterDiv3.id = "headerblock3";
        cell1OuterDiv3.innerHTML = '<div>Third thing</div>';

        var cell1OuterDiv4 = document.createElement('div');
        cell1OuterDiv4.className = "headerflexcell";
        cell1OuterDiv4.id = "headerblock4";
        
        var cellFourStr = "";
        cellFourStr += '<div class="" id="" style="display:block">';
        cellFourStr += '<div>';
        cellFourStr += '<b>Settings</b>';
        cellFourStr += '</div>';
        cellFourStr += '<div>';
        cellFourStr += '<b>Play next in series: </b><input name="serplaynext" id="serplaynext" type="checkbox">';
        cellFourStr += '</div>';
        cellFourStr += '<div>';
        cellFourStr += '<b>Resume play: </b><input name="resumeplay" id="resumeplay" type="checkbox">';
        cellFourStr += '</div>';
        cellFourStr += '</div>';
        
        cell1OuterDiv4.innerHTML = cellFourStr;
        
        var tmpWrapDiv = document.createElement('div');
        tmpWrapDiv.id = 'headerflexwrap';
        tmpWrapDiv.className = 'headerflexwrap';
        
        //tmpWrapDiv.innerHTML = cell1OuterDiv1 + cell1OuterDiv2 + cell1OuterDiv3 + cell1OuterDiv4;
        tmpWrapDiv.appendChild(cell1OuterDiv1);
        tmpWrapDiv.appendChild(cell1OuterDiv2);
        tmpWrapDiv.appendChild(cell1OuterDiv3);
        tmpWrapDiv.appendChild(cell1OuterDiv4);
        
        headerOuterDiv.appendChild(tmpWrapDiv);
        
        return headerOuterDiv;
    }
    docElRenderHeaderThreeCell(){
        var hContDiv = document.createElement('div');
        hContDiv.id = 'headercont';
        hContDiv.className = 'headercont';
        hContDiv.style.width = '1200px';
        hContDiv.style.height = '101px';
        hContDiv.style.display = 'inline-flex';
        //hContDiv.style.width = '1200px';
        
        var cell1Div = document.createElement('div');
        cell1Div.style.width = "100px";
        cell1Div.style.height = "100px";
        var tmpHtml = '';
        tmpHtml += '<a href="./vodlib_static_3.html">';
        tmpHtml += '<img src="./img/rmvod_badge_center.png" height="75" width="75" style="height:75px;width:75px;">';
        tmpHtml += '</a>';
        cell1Div.innerHTML = tmpHtml;
        
        var cell2Div = document.createElement('div');
        cell2Div.style.width = "890px";
        cell2Div.style.height = "100px";
        //cell2Div.style.overflow = "auto";
        var tmpHtml = '';
        tmpHtml += '<span id="header-title" style="font-weight:bold;font-size:large;">&nbsp;</span><br>';
        tmpHtml += '<div id="header-artifact-details" style="width:870px;height:60px;overflow:auto;">';
        tmpHtml += '<span id="header-synopsis" style="">&nbsp;</span><br>';
        tmpHtml += '<span id="header-production" style="">&nbsp;</span><br>';
        tmpHtml += '<span id="header-cast" style="">&nbsp;</span><br>';
        tmpHtml += '<span id="" style="">&nbsp;</span><br>';
        tmpHtml += '</div>';
        cell2Div.innerHTML = tmpHtml;
        
        var cell3Div = document.createElement('div');
        cell3Div.style.width = "890px";
        cell3Div.style.height = "100px";
        cell3Div.id = "headerblock3";
        var tmpHtml = '';
        tmpHtml += "<b>0000-11-22 11:22</b>"
        cell3Div.innerHTML = tmpHtml;
        
        hContDiv.appendChild(cell1Div);
        hContDiv.appendChild(cell2Div);
        hContDiv.appendChild(cell3Div);
        
        return hContDiv;
    }
    docElTabContainer() {
        
        var renderTabTabDiv = function(tabNmbrIn,tabLabelIn,selBoolIn) {
            var tabTabDiv = document.createElement('div');
            tabTabDiv.className = "tab-unsel";
            tabTabDiv.id = "tab" + tabNmbrIn.toString();
            var tmpHtml = "";
            var className = "tab-unsel";
            console.log("className: " + className);
            if (selBoolIn == true) {
                className = "tab-sel";
                console.log("className: " + className);
            }
            tmpHtml += '<span class="' + className + '" id="tabspan' + tabNmbrIn.toString() + '" onclick="switchboard(\'tabPick\',this.id,{})">';
            tmpHtml += tabLabelIn;
            tmpHtml += '</span>';
            tabTabDiv.innerHTML = tmpHtml;
            tabTabDiv.className = className;
            return tabTabDiv;
        }
        
        var renderTabContDiv = function(idStrIn,dispBoolIn,contHtmlStrIn) {
            var tabContDiv = document.createElement('div');
            tabContDiv.className = "featureelement0";
            tabContDiv.id = idStrIn;
            tabContDiv.style.display = "none";
            if (dispBoolIn == true) {
                tabContDiv.style.display = "block";
            }
            tabContDiv.style.overflow = "auto";
            tabContDiv.innerHTML = contHtmlStrIn;
            return tabContDiv;
        }
        
        var tabCtrlDiv = document.createElement('div');
        tabCtrlDiv.style.width = "1200px";
        tabCtrlDiv.style.height = "40px";
        tabCtrlDiv.style.display = "inline-flex";
        
        tabCtrlDiv.appendChild(renderTabTabDiv(0,'Player',false));
        tabCtrlDiv.appendChild(renderTabTabDiv(1,'List/Search',true));
        tabCtrlDiv.appendChild(renderTabTabDiv(2,'Edit',false));
        tabCtrlDiv.appendChild(renderTabTabDiv(3,'Settings',false));
        
        
        var tabContOuterDiv = document.createElement('div');
        tabContOuterDiv.className = "featurecont0";
        tabContOuterDiv.id = "featurecont";
        tabContOuterDiv.style.dicplay = "block";
        //tabContOuterDiv.style.width = "1200px";
        //tabContOuterDiv.style.height = "550px";
        
        var tmpHtml = '';
        //tmpHtml += '<div style="width:1150px;height:550px;vertical-align:center;horizontal-align:center;margin:20px;">';
        tmpHtml += '<div style="width:1100px;height:500px;vertical-align:center;horizontal-align:center;margin:20px;">';
        tmpHtml += '<div style="margin-left:200px; margin-right:80px;">';
        tmpHtml += '&nbsp;<br>';
        tmpHtml += '<img src="./img/rmvod_badge_center.png" height=450 width=450>';
        tmpHtml += '</div>';
        tmpHtml += '</div>';
        
        tabContOuterDiv.appendChild(renderTabContDiv('structfeatureplayer',false,tmpHtml));
        
        
        var tmpHtml = '';
        tmpHtml += '<div style="display:inline-flex;">';
        //tmpHtml += '<div style="width:580px;height:550px;">';
        tmpHtml += '<div style="width:580px;height:518px;">';
        tmpHtml += '<div id="headerblock2">';
        tmpHtml += '<div style="margin:8px;">';
        tmpHtml += '&nbsp;';
        tmpHtml += '</div></div></div>';
        //tmpHtml += '<div style="width:580px;height:550px;">';
        tmpHtml += '<div style="width:580px;height:518px;">';
        tmpHtml += '<div class="listwidget" id="sideartilistwidget" style="">';
        tmpHtml += '<div>&nbsp;</div>';
        tmpHtml += '</div></div>';
        
        tabContOuterDiv.appendChild(renderTabContDiv('structfeaturesearch',true,tmpHtml));
        
        
        tmpHtml = '';
        tmpHtml += '<div style="margin-left:375px; margin-right:80px;">';
        tmpHtml += '&nbsp;<br>';
        tmpHtml += '<img src="./img/rmvod_badge_center.png" height=450 width=450>';
        tmpHtml += '</div>';
        
        tabContOuterDiv.appendChild(renderTabContDiv('structfeatureedit',false,tmpHtml));
        
        
        tmpHtml = '';
        tmpHtml += '<div class="headerflexcell" id="headerblock4">';
        tmpHtml += '<div class="" id="" style="display:block">';
        tmpHtml += '<div><b>Settings</b></div>';
        tmpHtml += '<div><b>Play next in series: </b><input name="serplaynext" id="serplaynext" type="checkbox"></div>';
        tmpHtml += '<div><b>Resume play: </b><input name="resumeplay" id="resumeplay" type="checkbox"></div>';
        tmpHtml += '</div>';
        tmpHtml += '</div>';
        
        tabContOuterDiv.appendChild(renderTabContDiv('structfeaturesettings',false,tmpHtml));
        
                    
        var outerDiv = document.createElement('div');
        outerDiv.appendChild(tabCtrlDiv);
        outerDiv.appendChild(tabContOuterDiv);
        return outerDiv;
    }
    docElRenderFeature(){
        var featureDiv = document.createElement('div');
        featureDiv.id = 'featurecont';
        featureDiv.className = 'featurecont';
        
        var playContStr = '';
        playContStr += '<div class="featureelement" id="structfeatureplayer" style="display:block;"><!-- Player Container -->';
        playContStr += '<div style="margin-left:80px; margin-right:80px;">';
        playContStr += '&nbsp;Player Container<br>';
        playContStr += '<img src="./img/rmvod_badge_center.png" height=500 width=500>';
        playContStr += '</div>';
        playContStr += '</div>';
        
        var srchContStr = '';
        srchContStr += '<div class="featureelement" id="structfeaturesearch" style="display:none;"><!-- Search Container -->';
        srchContStr += '&nbsp;Search Container';
        srchContStr += '</div>';
        
        var editContStr = '';
        editContStr += '<div class="featureelement" id="structfeatureedit" style="display:none;"><!-- ArtiEdit Container -->';
        editContStr += '&nbsp;ArtiEdit Container';
        editContStr += '</div>';
        
        var tmpIntDiv = document.createElement('div');
        tmpIntDiv.style.display = "block";
        tmpIntDiv.innerHTML = playContStr + srchContStr + editContStr;
        
        featureDiv.innerHTML = "";
        featureDiv.appendChild(tmpIntDiv);
        
        return featureDiv;
    }
    docElRenderList(){
        var listContDiv = document.createElement('div');
        listContDiv.id = 'listcontainer';
        listContDiv.className = 'listcontainer';
        
        var listHtmlStr = '';
        listHtmlStr += '<div>';
        listHtmlStr += '<div style="display:block;"><span onclick="switchboard(\'exposePlayer\',\'\',{})"><b><u>Show Player</u></b></span></div>';
        listHtmlStr += '<div class="listwidget" id="sideartilistwidget" style=""><!-- List Widget -->';
        listHtmlStr += '&nbsp;<!-- Artifact List Widget goes here. --> <br>';
        listHtmlStr += '</div>';
        listHtmlStr += '</div>';
        
        listContDiv.innerHTML = listHtmlStr;
        return listContDiv;
    }
    docElFooter(){
        
        var footerOuterDiv = document.createElement('div');
        footerOuterDiv.innerText = "Footer";
        
        var versionsContainerDiv = document.createElement('div');
        var tmpHtml = "";
        tmpHtml += '<span id="version_html" style="font-family:courier;font-size:small;color:#888888;">html version: 0.3.1</span>';
        tmpHtml += '&nbsp;&nbsp;';
        tmpHtml += '<span id="version_js" style="font-family:courier;font-size:small;color:#888888;">js version: 0.2.1</span>';
        tmpHtml += '&nbsp;&nbsp;';
        tmpHtml += '<span id="version_db" style="font-family:courier;font-size:small;color:#888888;">db version: 0.1.0</span>';
        tmpHtml += '&nbsp;&nbsp;';
        tmpHtml += '<span id="version_api" style="font-family:courier;font-size:small;color:#888888;">api version: 0.1.2</span>';
        tmpHtml += '&nbsp;&nbsp;';
        tmpHtml += '<span id="version_css" style="font-family:courier;font-size:small;color:#888888;">css version: 0.2.1</span>';
        tmpHtml += '&nbsp;&nbsp;';
        versionsContainerDiv.innerHTML = tmpHtml;
        
        footerOuterDiv.appendChild(versionsContainerDiv);
        
        return footerOuterDiv;
        
        
        
            //<div><!-- Footer -->Footer<br>
                //<div>
                    //<span id="version_html" style="font-family:courier;font-size:small;color:#888888;">html version: 0.3.1</span>
                    //&nbsp;&nbsp;
                    //<span id="version_js" style="font-family:courier;font-size:small;color:#888888;">js version: 0.2.1</span>
                    //&nbsp;&nbsp;
                    //<span id="version_db" style="font-family:courier;font-size:small;color:#888888;">db version: 0.1.0</span>
                    //&nbsp;&nbsp;
                    //<span id="version_api" style="font-family:courier;font-size:small;color:#888888;">api version: 0.1.2</span>
                    //&nbsp;&nbsp;
                    //<span id="version_css" style="font-family:courier;font-size:small;color:#888888;">css version: 0.2.1</span>
                    //&nbsp;&nbsp;
                //</div>            
            //</div>
        
        
        
        
    }
    // Render Page Layouts
    basePageLayout01(){  //  BASE PAGE LAYOUT FOR vodlib_static_2.html
        var headerOuterDiv = this.docElRenderHeaderFourCell();
        var featureDiv = this.docElRenderFeature();
        var listContDiv = this.docElRenderList();
        
        var bigBizDiv = document.createElement('div');
        bigBizDiv.id = 'bigbusiness';
        bigBizDiv.className = 'bigbusiness';
        bigBizDiv.innerHTML = "<!-- RENDERED BY basePageLayout01 -->";

        bigBizDiv.appendChild(featureDiv);
        bigBizDiv.appendChild(listContDiv);
        
        var masterCont = document.getElementById('mastercont');
        masterCont.innerHTML = '';
        masterCont.appendChild(headerOuterDiv);
        masterCont.appendChild(bigBizDiv);
        
        //this.clockSet();
    }
    basePageLayout02(){  //  BASE PAGE LAYOUT FOR vodlib_static_3.html
        var headerOuterDiv = this.docElRenderHeaderThreeCell();
        var featureDiv = this.docElTabContainer();
        var footerDiv = this.docElFooter();
        
        var masterCont = document.getElementById('mastercont');
        masterCont.innerHTML = '';
        masterCont.appendChild(headerOuterDiv);
        masterCont.appendChild(featureDiv);
        masterCont.appendChild(footerDiv);
        
    }
    contCookieOnLoad() {
        // OnLoad, if "Resume Playback" is checked, check to see if 3 
        // "Continue" cookies are set.  If so, get the values of the 
        // 3 cookies, clear the 3 cookies, and begin playback of the 
        // SRC URI at the "Progress" Point
        
        
        //  We're going to fake checking the chekcbox for now
        
        
        var cbFunc = function () {
            
            // resumeplay
            
            try {
                var playerDE = document.getElementById('actualvideoplayer');
                var wa = new RMVodWebApp();
                //playerDE.pause();
                playerDE.currentTime = wa.cc.getCookie('playback_offset');
                //playerDE.play();
                if (playerDE.currentSrc == wa.cc.getCookie('artifact_source_uri')) {
                    //wa.cc.clearCookie('');
                    //wa.cc.clearCookie('playback_offset');
                    //wa.cc.clearCookie('');
                    //console.log("contCookieOnLoad.cbFunc - Yay, we did it.  Trying to clear the interval " + intervHandle);
                    clearInterval(intervHandle);
                } else {
                    if ((playerDE.currentSrc != "") & (wa.cc.getCookie('artifact_source_uri') == "")) {
                        wa.cc.setCookie('artifact_source_uri', playerDE.currentSrc,5);
                        if (playerDE.currentSrc == wa.cc.getCookie('artifact_source_uri')) {
                            clearInterval(intervHandle);
                            //console.log("contCookieOnLoad.cbFunc - We're clearly playing something, so... hammering it into place.")
                        }
                    } else {
                        console.log("contCookieOnLoad.cbFunc - Still waiting for Cookie artifact_source_uri to match what's in the player");
                        console.log('contCookieOnLoad.cbFunc - playerDE.currentSrc: ' + playerDE.currentSrc);
                        console.log("contCookieOnLoad.cbFunc - wa.cc.getCookie('artifact_source_uri'): " + wa.cc.getCookie('artifact_source_uri'));
                    }
                }
            } catch (e) {
                console.log("contCookieOnLoad.cbFunc - Resume Play Position failed because " + e);
            }
        }
        
        // var srcUri = this.cc.getCookie('artifact_source_uri');
        // var playPos = this.cc.getCookie('playback_offset');
        
        var cbDE = document.getElementById('resumeplay');
        if (cbDE.checked == true) {
            var playAID = this.cc.getCookie('playing_aid');
            //console.log('contCookieOnLoad -  Going to try to play ' + playAID);
            this.vodPlayTitleApi2(playAID);
            //console.log("contCookieOnLoad -  About to launch the resume playback interval.  Brace for shitstorm.");
            var intervHandle = setInterval(cbFunc,1000);
            this.cc.setCookie('cont_play_sample_int_handle',intervHandle,5);
        }
        
    }
    contCookiePostInterval(delayMsIn){
        // On Start of "Normal" Playback, an Interval is started (6000ms, 
        // for example) which periodically writes cookies to track the 
        // progress of playback of the current video. Initially 3 cookies 
        // are written:  The handle of the Interval, the SRC URI for 
        // the artifact, and the Integer "Progress" of the playback, 
        // in seconds.
        
        // On each running of the Interval, the Handle and SRC URI are 
        // confirmed to be correct, and the Progress is written
        
        // On natural conclusion of playback, the 3 "Continue" cookies 
        // are cleared
        var delayMs = 60000;
        if (delayMsIn != undefined){
            if(typeof delayMsIn == 'number') {
                delayMs = parseInt(delayMsIn);
            }
        }
        
        var cbFunc = function () {
            var wa = new RMVodWebApp();
            var playerDE = document.getElementById('actualvideoplayer');
            if (playerDE.paused == false) {
                var currTime = parseInt(playerDE.currentTime);
                var currSrc = playerDE.currentSrc;
                wa.cc.setCookie('artifact_source_uri',currSrc);
                wa.cc.setCookie('playback_offset',currTime);
                //console.log(currTime);
                //console.log(currSrc);
            } // else {
                //console.log("Player is paused.  Will resume tracking when playback is resumed");
            //}  
        }
        
        var intervalHandle = setInterval(cbFunc,delayMs);
        this.cc.setCookie('cont_play_sample_int_handle',intervalHandle,5);
        return intervalHandle;
    }
    contCookieNaturalEnd () { //intHandleIn
        var intHandleIn = this.cc.getCookie('cont_play_sample_int_handle');
        //console.log ("Got interval handle " + intHandleIn + " from cookie cont_play_sample_int_handle" );
        clearInterval(intHandleIn);
        //console.log("Is it cleared?");
        this.cc.clearCookie('artifact_source_uri');
        this.cc.clearCookie('playback_offset');
        this.cc.clearCookie('cont_play_sample_int_handle');
        this.cc.clearCookie('play_aid');
    }
    // NEW SIDE LIST HANDLING
    renderSALByIdList(artiIdListIn){
        // Whole List -- No details or episodes
        var allowedMajTypes = ['tvseries','movie'];
        var tmpDiv = document.createElement('div');
        for (var idx = 0; idx<artiIdListIn.length; idx++ ) {
            if (allowedMajTypes.indexOf(artiIdListIn[idx]['majtype']) > -1){
                tmpDiv.appendChild(this.renderSALElementById(artiIdListIn[idx]));
            }
        }
        return tmpDiv;
    }
    renderSALElementById(artiTitleIdObjIn){
        var elementDiv = undefined;
        switch (artiTitleIdObjIn['majtype']) {
            case 'movie' :
                // This is how we do a "movie" row
                elementDiv = this.renderSideListMovie(artiTitleIdObjIn);
                break;
                
            case 'tvepisode' :
                // This is how we do an episode of a tv series
                elementDiv = this.renderSideListTvEpisode(artiTitleIdObjIn);
                break;
                
            case 'tvseries' :
                // This is how we do a tv series header/container
                elementDiv = this.renderSideListTvSeries(artiTitleIdObjIn);
                break;
            
            default :
                // this is where we punt.
                break;
        }
        return elementDiv;
    }
    renderSideListMovie(artiTIDobjIn){
        var rplStr = this.cc.getCookie('recentPlays');
        if (rplStr == undefined) {
            rplStr = '';
        }
        var titleSpanStyle = "";
        var tdSpanClass = "listtitleunseen";
        if (rplStr.indexOf(artiTIDobjIn['artifactid']) > -1) {
            tdSpanClass = "listtitleseen";
        }
        const spanId = artiTIDobjIn['artifactid'] + '_list-title-span';
        var tdSpanOnclick = "switchboard('vodPlayTitle','" + artiTIDobjIn['artifactid'] + "',{})"; //artiTIDobjIn['artifactid'];
        var tdTitle = artiTIDobjIn['title'];
        var titleDiv = document.createElement('div');
        titleDiv.className = "listelconttitle";
        var trunclength = 42;
        if (tdTitle.length > trunclength) {
            titleDiv.innerHTML = '<span id="' + spanId + '" class="' + tdSpanClass + '" onclick="' + tdSpanOnclick + '"><b><u>' + tdTitle.substring(0,(trunclength-3)) + '...</u></b></span>';
        } else {
            titleDiv.innerHTML = '<span id="' + spanId + '" class="' + tdSpanClass + '" onclick="' + tdSpanOnclick + '"><b><u>' + tdTitle + '</u></b></span>';
        }
        
        // Expand Button DIV
        var bdSpanClass = '';
        var bdSpanOnclick = "switchboard('xpopsldetail','" + artiTIDobjIn['artifactid'] + "',{})"; //artiTIDobjIn['artifactid']
        var buttDiv = document.createElement('div');
        buttDiv.className = "listelcontxpbutt";
        buttDiv.innerHTML = '<span class="' + bdSpanClass + '" onclick="' + bdSpanOnclick + '"><u>Det</u></span>';
        
        // Container for Title and Button
        var titleRowDiv = document.createElement('div');
        titleRowDiv.className = "listelconttitlelink";
        titleRowDiv.appendChild(titleDiv);
        titleRowDiv.appendChild(buttDiv);
        
        // Container/placeholder for Artifact Detail
        var detailOuterDiv = document.createElement('div');
        detailOuterDiv.id = artiTIDobjIn['artifactid'] + '-sidelist-detail-outer';
        detailOuterDiv.className = "listeldetailouter";
        detailOuterDiv.style.display = 'none';
        
        // Container for whole List element
        var listElContainer =  document.createElement('div');
        listElContainer.className = "listelcontainer";
        listElContainer.id = artiTIDobjIn['artifactid'] + '-sidelist-element';
        listElContainer.appendChild(titleRowDiv);
        listElContainer.appendChild(detailOuterDiv);
        
        return listElContainer;
    }
    renderSideListTvSeries(artiTIDobjIn){
        var tdSpanClass = "";
        var tdSpanOnclick = "switchboard('tvsExpandEpisodes','" + artiTIDobjIn['artifactid'] + "',{})"; //artiTIDobjIn['artifactid'];
        var tdTitle = artiTIDobjIn['title']; // + "(series)";
        var titleDiv = document.createElement('div');
        titleDiv.className = "listelconttitle";
        
        var trunclength = 38;
        if (tdTitle.length >= trunclength) {
            //titleDiv.innerHTML = '<span class="' + tdSpanClass + '" onclick="' + tdSpanOnclick + '"><b><u>' + tdTitle.substring(0,(trunclength-3)) + '...(series)</u></b></span>';
            titleDiv.innerHTML = '<span class="' + tdSpanClass + '" onclick="' + tdSpanOnclick + '"><b><u>' + tdTitle.substring(0,(trunclength-3)) + '...<span style="color:#c0c080">(series)</span></u></b></span>';
        } else {
            //titleDiv.innerHTML = '<span class="' + tdSpanClass + '" onclick="' + tdSpanOnclick + '"><b><u>' + tdTitle + '(series)</u></b></span>';
            titleDiv.innerHTML = '<span class="' + tdSpanClass + '" onclick="' + tdSpanOnclick + '"><b><u>' + tdTitle + '<span style="color:#c0c080">(series)</u></b></span>';
        }
        
        // Container for Title and Button
        var titleRowDiv = document.createElement('div');
        titleRowDiv.className = "listelconttitlelink";
        titleRowDiv.appendChild(titleDiv);
        
        // Container/placeholder for Artifact Detail  <<==== NEW
        var detailOuterDiv = document.createElement('div');
        detailOuterDiv.id = artiTIDobjIn['artifactid'] + '-sidelist-detail-outer';
        detailOuterDiv.className = "listeldetailouter";
        detailOuterDiv.style.display = 'none';
        
        // Container/placeholder for Episode List
        var epListOuterDiv = document.createElement('div');
        epListOuterDiv.id = artiTIDobjIn['artifactid'] + '-sidelist-episode-list-outer';
        epListOuterDiv.className = "listelseriescollep";
        
        // Container for whole List element
        var listElContainer =  document.createElement('div');
        listElContainer.className = "listelcontainer";
        listElContainer.id = artiTIDobjIn['artifactid'] + '-sidelist-element';
        listElContainer.appendChild(titleRowDiv);
        listElContainer.appendChild(detailOuterDiv);
        listElContainer.appendChild(epListOuterDiv);
        
        return listElContainer;
    }
    renderSideListTvEpisode(artiTIDobjIn){
        var rplStr = this.cc.getCookie('recentPlays');
        if (rplStr == undefined) {
            rplStr = '';
        }
        
        const spanId = artiTIDobjIn['artifactid'] + '_list-title-span';
        
        var tdSpanClass = "listtitleunseen";
        if (rplStr.indexOf(artiTIDobjIn['artifactid']) > -1) {
            tdSpanClass = "listtitleseen";
        }
        var tdSpanOnclick = "switchboard('vodPlayTitle','" + artiTIDobjIn['artifactid'] + "',{})"; //artiTIDobjIn['artifactid'];
        var tdTitle = artiTIDobjIn['title'];
        var titleDiv = document.createElement('div');
        titleDiv.className = "listelseriescolleptitle";
        
        var trunclength = 35;
        if (tdTitle.length >= trunclength) {
            titleDiv.innerHTML = '<span id="' + spanId + '" class="' + tdSpanClass + '" onclick="' + tdSpanOnclick + '"><b><u>' + tdTitle.substring(0,(trunclength-3)) + '...</u></b></span>'; //...(series)
        } else {
            titleDiv.innerHTML = '<span id="' + spanId + '" class="' + tdSpanClass + '" onclick="' + tdSpanOnclick + '"><b><u>' + tdTitle + '</u></b></span>'; // (series)
        }
        
        // Expand Button DIV
        var bdSpanClass = '';
        var bdSpanOnclick = "switchboard('xpopsldetail','" + artiTIDobjIn['artifactid'] + "',{})"; //artiTIDobjIn['artifactid']
        var buttDiv = document.createElement('div');
        buttDiv.className = "listelcontxpbutt";
        buttDiv.innerHTML = '<span class="' + bdSpanClass + '" onclick="' + bdSpanOnclick + '"><u>Det</u></span>';
        
        // Container for Title and Button
        var titleRowDiv = document.createElement('div');
        titleRowDiv.className = "listelseriescolleptitlelink";
        titleRowDiv.appendChild(titleDiv);
        titleRowDiv.appendChild(buttDiv);
        
        // Container/placeholder for Artifact Detail
        var detailOuterDiv = document.createElement('div');
        detailOuterDiv.id = artiTIDobjIn['artifactid'] + '-sidelist-detail-outer';
        detailOuterDiv.className = "listelseriescollepdetail";
        detailOuterDiv.style.display = 'none';
        
        // Container for whole List element
        var listElContainer =  document.createElement('div');
        listElContainer.className = "listelseriescollepcont";
        listElContainer.id = artiTIDobjIn['artifactid'] + '-sidelist-episode-element';
        listElContainer.appendChild(titleRowDiv);
        listElContainer.appendChild(detailOuterDiv);
        
        return listElContainer;
    }
    populateSeriesEpisodes(seriesArtiIdIn){
        const cbFunc = function (objIn) {
            var epListDEID = seriesArtiIdIn += '-sidelist-episode-list-outer';
            document.getElementById(epListDEID).innerHTML = '';
            var wa = new RMVodWebApp();
            for (var idx = 0; idx < objIn.length; idx++) {
                var listDiv = wa.renderSALElementById(objIn[idx]);
                document.getElementById(epListDEID).appendChild(listDiv);
            }
        }
        const endpoint = '/rmvid/api/seriestidlist/get';
        const payloadObj = {'artifactid':seriesArtiIdIn};
        this.genericApiCall(payloadObj,endpoint,cbFunc);
    }
    populateArtifactDetails(artiIdIn){
        
        this.apiFetchPersonsList();
        this.apiFetchCompaniesList();
        this.apiFetchTagsList();
                
        const cbFunc = function (objIn) {
            var wa = new RMVodWebApp();
            const colList = ['title','majtype','relyear','tags','synopsis','runmins','director','writer','primcast','relorg','season','episode','file','filepath','eidrid','imdbid','arbmeta','artifactid'];
            var dValStr = "" ;
            for ( var idx=0; idx<colList.length; idx++ ) {
                dValStr += '<b>' + colList[idx] + ": </b>"; // + objIn[colList[idx]] + '<br>';
                switch (colList[idx]) {
                    case 'director':
                    case 'writer':
                    case 'primcast':
                        dValStr += wa.l2sSrch(objIn[colList[idx]]) + '<br>';
                        break;
                    case "imdbid":
                        if ((objIn[colList[idx]] != 'none') && (objIn[colList[idx]] != 'string')) {
                            dValStr += '<a target="_blank" href="https://www.imdb.com/title/' + objIn[colList[idx]] + '">' + objIn[colList[idx]] + '</a><br>';
                        } else {
                            dValStr += objIn[colList[idx]] + '<br>';
                        }
                        break;
                    default:
                        dValStr +=  objIn[colList[idx]]  + '<br>';
                        break;
                }
            }
            
            var innerHtml = '<span class="" id="" style="" >';
            innerHtml += dValStr;
            innerHtml += '</span><br>'
            innerHtml += '<span class="" id="" style="font-size:10px;"';
            innerHtml += 'onclick="switchboard(\'initiateArtiEdit\',\'' + objIn['artifactid'] + '\',{})" ';
            innerHtml += '>'; // initiateArtiEdit
            innerHtml += '<u>Edit</u>';
            innerHtml += '</span>';
            
            var docElId = artiIdIn + '-sidelist-detail-outer';
            var deetDiv = document.getElementById(docElId);
            deetDiv.innerHTML = innerHtml;
        }
        const endpoint = '/rmvid/api/artifact/get';
        const payloadObj = {'artifactid':artiIdIn};
        this.genericApiCall(payloadObj,endpoint,cbFunc);
    }
    tvsDetailShowButton(artiIdIn) {
        // "Show Details" button for a TV Series Artifact
        var innerHtml = '';
        innerHtml += '<span class="" id="" style="font-size:10px;"';
        innerHtml += 'onclick="switchboard(\'xpopslseriesdetail\',\'' + artiIdIn + '\',{})" ';
        innerHtml += '>';
        innerHtml += '<u>Show Series Details</u>';
        innerHtml += '</span>';
        
        var docElId = artiIdIn + '-sidelist-detail-outer';
        var deetDiv = document.getElementById(docElId);
        deetDiv.innerHTML = innerHtml;       
         
    }
    renderArtifactBlocksByIdList(artiIdListIn){
        var tmpDiv = document.createElement('div');
        for (var idx = 0; idx<artiIdListIn.length; idx++ ) {
            tmpDiv.appendChild(this.renderArtifactInitial(artiIdListIn[idx]));
        }
        return tmpDiv;
    }
    renderArtifactBlocksBySrchTxtApi(SrchStrIn){
        var cbFunc = function (objIn){
            var wa = new RMVodWebApp();
            var artiTitleIdList = wa.sse.ssRead('titleidlist');
            if (objIn.length > 0) {
                var tmpDiv = wa.renderSALByIdList(objIn);
                document.getElementById('sideartilistwidget').innerHTML = '';
                document.getElementById('sideartilistwidget').appendChild(tmpDiv);
            }
        }
        var payloadObj = {};
        if (SrchStrIn.length > 0){
            payloadObj = {'srchstr':SrchStrIn};
        }
        var endpoint = "/rmvid/api/simpletxtsrch/get";
        this.genericApiCall(payloadObj,endpoint,cbFunc);
    }
    renderArtifactBlocksByTagApi(tagStrIn){
        var cbFunc = function (objIn){
            var wa = new RMVodWebApp();
            var artiTitleIdList = wa.sse.ssRead('titleidlist');
            var tmpDiv = wa.renderSALByIdList(objIn);
            document.getElementById('sideartilistwidget').innerHTML = '';
            document.getElementById('sideartilistwidget').appendChild(tmpDiv);
        }
        var payloadObj = {};
        if (tagStrIn.length > 0){
            payloadObj = {'tag':tagStrIn};
        }
        var endpoint = "/rmvid/api/titleidlist/get";
        this.genericApiCall(payloadObj,endpoint,cbFunc);
    }
    renderArtifactBlocksByMajTypeApi(majtypeStrIn){
        console.log("renderArtifactBlocksByMajTypeApi: " + majtypeStrIn);
        var cbFunc = function (objIn){
            var wa = new RMVodWebApp();
            var artiTitleIdList = wa.sse.ssRead('titleidlist');
            var tmpDiv = wa.renderSALByIdList(objIn);
            document.getElementById('sideartilistwidget').innerHTML = '';
            document.getElementById('sideartilistwidget').appendChild(tmpDiv);
        }
        var payloadObj = {};
        if (majtypeStrIn.length > 0){
            payloadObj = {'majtype':majtypeStrIn};
        }
        var endpoint = "/rmvid/api/titleidlist/get";
        this.genericApiCall(payloadObj,endpoint,cbFunc);
    }
    renderArtifactBlocksByRelyearApi(relyear1In,relyear2In){
        console.log("renderArtifactBlocksByRelyearApi: " + relyear1In, relyear2In);
        var cbFunc = function (objIn){
            var wa = new RMVodWebApp();
            var artiTitleIdList = wa.sse.ssRead('titleidlist');
            var tmpDiv = wa.renderSALByIdList(objIn);
            document.getElementById('sideartilistwidget').innerHTML = '';
            document.getElementById('sideartilistwidget').appendChild(tmpDiv);
        }
        var payloadObj = {};
        if (relyear2In > 1900){
            payloadObj = {'relyear1':relyear1In,'relyear2':relyear2In};
        }
        var endpoint = "/rmvid/api/titleidlist/get";
        this.genericApiCall(payloadObj,endpoint,cbFunc);
    }
    execSearchSingleFactor(factorStrIn,srchValObjIn) {
        switch (factorStrIn) {
            case "tag":
                //thing
                this.renderArtifactBlocksByTagApi(srchValObjIn['tag']);
                break;
            case "text":
                //thing
                this.renderArtifactBlocksBySrchTxtApi(srchValObjIn['text']);
                break;
            case "majtype":
                //thing
                this.renderArtifactBlocksByMajTypeApi(srchValObjIn['majtype']);
                break;
            case "relyear":
                //thing
                this.renderArtifactBlocksByRelyearApi(srchValObjIn['relyear1'],srchValObjIn['relyear2']);
                break;
            case "whereclause":
                console.log("execSearchSingleFactor: " + factorStrIn + ": " + srchValObjIn[factorStrIn]);
                
                var cbFunc = function (objIn){
                    var wa = new RMVodWebApp();
                    var artiTitleIdList = wa.sse.ssRead('titleidlist');
                    if (objIn.length > 0) {
                        var tmpDiv = wa.renderSALByIdList(objIn);
                        document.getElementById('sideartilistwidget').innerHTML = '';
                        document.getElementById('sideartilistwidget').appendChild(tmpDiv);
                    }
                }
                var payloadObj = {};
                if (srchValObjIn[factorStrIn].length > 0){
                    payloadObj = {'whereclause':srchValObjIn[factorStrIn]};
                }
                var endpoint = "/rmvid/api/titleidlist/get";
                this.genericApiCall(payloadObj,endpoint,cbFunc);
                break;
            default:
                console.log("execSearchSingleFactor fell through: ", factorStrIn, JSON.stringify(srchValObjIn));
        }
    }
    renderArtifactInitial (artiIdIn) {
        var blob = this.sse.ssRead('blob');
        var artiData = blob['artifacts'][artiIdIn];
        var artiTags = blob['a2t'][artiIdIn];
        
        var firstDisplayList = ['title','majtype','season','episode','runmins'];
        
        // Create "outermost" div
        var divOutermost = document.createElement('div');
        divOutermost.id = artiIdIn + '-outermost';
        divOutermost.className = "artifact-outermost";
        divOutermost.style = "display:block;";
        
        // Create "Initial Display Row" div
        var divInitialDisplay = document.createElement('div');
        divInitialDisplay.className = "artifact-default-disp-row";
        divInitialDisplay.style = "display:inline-flex;";     
        
        var widthList = ['300px','100px','40px','40px','50px','75px'];
        // Create cells for "Initial Display Row"
        for (var idx=0; idx<firstDisplayList.length; idx++ ) {
            var tmpDiv = document.createElement('div');
            tmpDiv.className = "artifact-default-disp-cell"; // artifact-default-disp-cel
            tmpDiv.style = "display:inline-flex;width:" + widthList[idx] + ';';
            // Conditional handling  should be here so that 'title' is presented
            // as a 'play title' link
            var fieldKey = firstDisplayList[idx];
            if (fieldKey == 'title') {
                //make it a link
                tmpDiv.innerHTML = '<span class="title-play-link" onclick="switchboard(\'vodPlayTitle\',\'' + artiIdIn + '\',{})"><b><u>' + artiData[fieldKey] + '</u></b></span>';
            } else {
                tmpDiv.innerText = artiData[fieldKey];
            }
            divInitialDisplay.appendChild(tmpDiv);
        }
        var tmpDiv = document.createElement('div');
        tmpDiv.className = "artifact-default-disp-cell";
        tmpDiv.style = "display:inline-flex;width:" +  widthList[5] + ';';  // widthList[5]
        
        var tmpButtonStr = '<button onclick="switchboard(\'toggleDivViz\',\'';
        tmpButtonStr += artiIdIn.trim() + '-reveal-container';
        tmpButtonStr += '\',{})">Button</button>';
        
        tmpDiv.innerHTML = tmpButtonStr;
        
        // <button onclick="toggleDivViz()" label="">Button</button>
        divInitialDisplay.appendChild(tmpDiv);
        
        // Create "Generic Row Container" div
        var divGenericRow = document.createElement('div');
        divGenericRow.className = "artifact-default-disp-row";
        divGenericRow.style = "display:inline-flex;";     
        
        divGenericRow.appendChild(divInitialDisplay)
        divOutermost.appendChild(divGenericRow);
        
        var divDetailContainer = document.createElement('div');
        divDetailContainer.className = "artifact-detail-reveal-container";
        divDetailContainer.id = artiIdIn + "-reveal-container";
        divDetailContainer.style = "display:none;";
        divDetailContainer.innerText = "This page intentionally left blank. " + artiIdIn;
        divOutermost.appendChild(divDetailContainer);
        
        var divEditContainer = document.createElement('div');
        divEditContainer.className = "artifact-edit-container";
        divEditContainer.id = artiIdIn + "-edit-container";
        divEditContainer.style = "display:none;";
        divEditContainer.innerText = "This page intentionally left blank. " + artiIdIn;
        divOutermost.appendChild(divEditContainer);
        return divOutermost;
    }
    renderArtifactDetailApi(artiIdIn){
        var cbFunc = function (objIn) {
            var wa = new RMVodWebApp();
            console.log('renderArtifactDetailApi.cbFunc');
            wa.renderArtifactDetailHeader(objIn);
        }
        const endpoint = '/rmvid/api/artifact/get';
        const payload = {'artifactid':artiIdIn};
        this.genericApiCall(payload,endpoint,cbFunc);
    }
    renderArtifactDetailHeader(artiObj){
        //console.log('renderArtifactDetailHeader');
        var prodStr = '';
        prodStr += 'Writer(s): ' + this.l2sSrch(artiObj['writer']) + ' | ';
        prodStr += 'Director(s): ' + this.l2sSrch(artiObj['director']) + ' | ';
        prodStr += 'Runtime: ' + artiObj['runmins'] + ' | ';
        prodStr += 'Release Yr.: ' + artiObj['relyear'] + ' | ';
        //console.log(prodStr);
        
        var castStr = '';
        castStr +=  this.l2sSrch(artiObj['primcast']);
        //console.log(castStr);
        
        var synoStr = '';
        synoStr += 'Synopsis: ';
        if (artiObj['majtype'] == "tvepisode") {
            synoStr += '(Season ' + artiObj['season'] + ' Episode: ' + artiObj['episode'] + ') ';
        }
        synoStr += artiObj['synopsis'];
        
        document.getElementById('header-title').innerText = 'Now Playing: ' + artiObj['title'];
        document.getElementById('header-synopsis').innerText = synoStr;
        document.getElementById('header-production').innerHTML = 'Production: ' + prodStr;
        document.getElementById('header-cast').innerHTML = 'Cast: ' + castStr;
    }
    renderArtifactEdit(artiIdIn){
        console.log('renderArtifactEdit: ' + artiIdIn);
        var cbFunc = function (dataObjIn) {
            //var wa = new RMVodWebApp();
            var sse = new RMSSSEnhanced();
            
            var simpleDisplayField = function (artiIdIn,labelIn,fieldNameIn,currentValueIn) {
                const fieldId = artiIdIn + '-edit-' + fieldNameIn + '-value';
                
                var rowContDiv = document.createElement('div');
                rowContDiv.className = "edit-form-row";
                
                var labelDiv = document.createElement('div');
                labelDiv.className = "edit-form-field-label";
                labelDiv.innerHTML = "<span style=\"\"><b>" + labelIn + ":&nbsp;</b></span>";
                
                // This needs an onChange script
                var valueDiv = document.createElement('div');
                valueDiv.className = "edit-form-field-value-orig";
                valueDiv.innerHTML = '<i><b>' + currentValueIn + '</b></i>';
                
                rowContDiv.appendChild(labelDiv);
                rowContDiv.appendChild(valueDiv);
                return rowContDiv;
            }
            var simpleTextField = function (artiIdIn,labelIn,fieldNameIn,currentValueIn) {
                const fieldId = artiIdIn + '-edit-' + fieldNameIn + '-value';
                
                var rowContDiv = document.createElement('div');
                rowContDiv.className = "edit-form-row";
                
                var labelDiv = document.createElement('div');
                labelDiv.className = "edit-form-field-label";
                labelDiv.innerHTML = "<span style=\"\"><b>" + labelIn + ":&nbsp;</b></span>";
                
                // This needs an onChange script
                var valueDiv = document.createElement('div');
                valueDiv.className = "edit-form-field-value-orig";
                var tmpHtml = '';
                tmpHtml = '<input type="text" class="edit-simple-text" ';
                tmpHtml += 'id="' + fieldId + '" ';
                // updateArtifactField
                // tmpHtml += 'onchange="console.log(\'' + fieldId + ' has changed.\')"';
                tmpHtml += 'onchange="switchboard(\'updateArtifactField\',\'' + fieldId + '\',{\'field\':\'' + fieldNameIn + '\'})" ';
                tmpHtml += ' value="' + currentValueIn + '">';
                
                valueDiv.innerHTML = tmpHtml;
                
                rowContDiv.appendChild(labelDiv);
                rowContDiv.appendChild(valueDiv);
                
                return rowContDiv;
            }
            var simpleTextareaField = function (artiIdIn,labelIn,fieldNameIn,currentValueIn) {
                const fieldId = artiIdIn + '-edit-' + fieldNameIn + '-value';
                
                var rowContDiv = document.createElement('div');
                rowContDiv.className = "edit-form-row";
                
                var labelDiv = document.createElement('div');
                labelDiv.className = "edit-form-field-label";
                labelDiv.innerHTML = "<span style=\"\"><b>" + labelIn + ":&nbsp;</b></span>";
                
                // This needs an onChange script
                var valueDiv = document.createElement('div');
                valueDiv.className = "edit-form-field-value-orig";
                // This needs an onChange script
                
                var tmpHtml = '';
                tmpHtml = '<textarea class="edit-simple-textarea" ';
                tmpHtml += 'id="' + fieldId + '" ';
                //tmpHtml += 'onchange="console.log(\'' + fieldId + ' has changed.\')"';
                //tmpHtml += 'onchange="console.log(' + fieldId + ' has changed.)"';
                tmpHtml += 'onchange="switchboard(\'updateArtifactField\',\'' + fieldId + '\',{\'field\':\'' + fieldNameIn + '\'})" ';
                tmpHtml += '>';
                tmpHtml += currentValueIn;
                tmpHtml += '</textarea>';
                
                valueDiv.innerHTML = tmpHtml;
                
                rowContDiv.appendChild(labelDiv);
                rowContDiv.appendChild(valueDiv);
                
                return rowContDiv;
            }
            var simpleListField = function (artiIdIn,labelIn,fieldNameIn,currentValueListIn,optionListIn) {
                const fieldId = artiIdIn + '-edit-' + fieldNameIn + '-value';
                
                var rowContDiv = document.createElement('div');
                rowContDiv.className = "edit-form-row";
                
                var labelDiv = document.createElement('div');
                labelDiv.className = "edit-form-field-label";
                labelDiv.innerHTML = "<span style=\"\"><b>" + labelIn + ":&nbsp;</b></span>";
                
                // This needs an onChange script
                var valueDiv = document.createElement('div');
                valueDiv.className = "edit-form-field-value-orig";
                
                var tmpHtml = '';
                tmpHtml = '<div><div>';
                // TEXTAREA needs onChange script to post current 
                tmpHtml += '<textarea class="edit-simple-textarea" ';
                tmpHtml += 'id="' + fieldId + '" ';
                // tmpHtml += 'onchange="console.log(\'' + fieldId + ' has changed.\')"';
                // tmpHtml += 'onchange="console.log(' + fieldId + ' has changed.)"';
                tmpHtml += 'onchange="switchboard(\'updateArtifactField\',\'' + fieldId + '\',{\'field\':\'' + fieldNameIn + '\'})" ';
                tmpHtml += ' >';
                
                tmpHtml += JSON.stringify(currentValueListIn);
                
                tmpHtml += '</textarea>';
                tmpHtml += '</div><div>';
                // SELECT needs an onChange script that appends selected 
                // value to list in textarea above 
                const slFieldId = fieldId + '-slist';
                tmpHtml += '<select id="';
                tmpHtml += slFieldId;
                tmpHtml += '" onchange="';
                tmpHtml += 'switchboard(\'appendArtifactFieldList\',\'' + slFieldId + '\',{\'listfield\':\'' + fieldId + '\'})';
                tmpHtml += '" name="">';
                tmpHtml += '<option value="none" selected>None</option>';
                for (var idx=0; idx<optionListIn.length; idx++ ){
                    tmpHtml += '<option value="' + optionListIn[idx] + '">' + optionListIn[idx] + '</option>';
                }
                tmpHtml += '</select>';
                tmpHtml += '<br>&nbsp;';
                tmpHtml += '</div></div>';
                
                valueDiv.innerHTML = tmpHtml;
                
                rowContDiv.appendChild(labelDiv);
                rowContDiv.appendChild(valueDiv);
                
                return rowContDiv;
            }
            var simpleSelectField = function (artiIdIn,labelIn,fieldNameIn,currentValueIn,optionListIn) {
                const fieldId = artiIdIn + '-edit-' + fieldNameIn + '-value';
                
                var rowContDiv = document.createElement('div');
                rowContDiv.className = "edit-form-row";
                
                var labelDiv = document.createElement('div');
                labelDiv.className = "edit-form-field-label";
                labelDiv.innerHTML = "<span style=\"\"><b>" + labelIn + ":&nbsp;</b></span>";
                
                // This needs an onChange script
                var valueDiv = document.createElement('div');
                valueDiv.className = "edit-form-field-value-orig";
                
                var tmpHtml = '';
                
                
                tmpHtml += '<select id="' + fieldId + '" '
                //tmpHtml += ' onchange="console.log(\'' + fieldId + ' has changed.\')" ';
                tmpHtml += ' onchange="switchboard(\'updateArtifactField\',\'' + fieldId + '\',{\'field\':\'' + fieldNameIn + '\'})" ';
                tmpHtml += ' name="">';
                for (var idx=0; idx<optionListIn.length; idx++ ){
                    var optionVal = optionListIn[idx];
                    if (optionVal == currentValueIn) {
                        tmpHtml += '<option value="' + optionListIn[idx] + '" selected>' + optionListIn[idx] + '</option>';
                    } else {
                        tmpHtml += '<option value="' + optionListIn[idx] + '">' + optionListIn[idx] + '</option>';
                    }
                }
                tmpHtml += '</select>';
                
                valueDiv.innerHTML = tmpHtml;
                
                
                rowContDiv.appendChild(labelDiv);
                rowContDiv.appendChild(valueDiv);
                
                return rowContDiv;
            }
            //
            var wrkFieldList = ['title','artifactid','majtype','runmins','season','episode','synopsis'];
            wrkFieldList.push('file');
            wrkFieldList.push('filepath');
            wrkFieldList.push('director');
            wrkFieldList.push('writer');
            wrkFieldList.push('primcast');
            wrkFieldList.push('relorg');
            wrkFieldList.push('relyear');
            wrkFieldList.push('eidrid');
            wrkFieldList.push('imdbid');
            wrkFieldList.push('arbmeta');
            wrkFieldList.push('tags');
            //wrkFieldList.push('');
            
            var edOuterDiv = document.createElement('div');
            edOuterDiv.className = 'edit-form-outer-container';
            
            var fieldDiv; 
            for (var idx=0; idx<wrkFieldList.length; idx++ ) {
                var wrkFieldName = wrkFieldList[idx];
                switch (wrkFieldName) {
                    case 'artifactid':
                        fieldDiv = simpleDisplayField(artiIdIn,wrkFieldName,wrkFieldName,dataObjIn[wrkFieldName]);
                        edOuterDiv.appendChild(fieldDiv);
                        break;
                    case 'title' :
                    case 'runmins' :
                    case 'season' :
                    case 'episode' :
                    case 'file' :
                    case 'filepath' :
                    case 'eidrid' :
                    case 'imdbid' :
                    case 'relyear' :
                        fieldDiv = simpleTextField(artiIdIn,wrkFieldName,wrkFieldName,dataObjIn[wrkFieldName]);
                        edOuterDiv.appendChild(fieldDiv);
                        break;
                    case 'director' :
                    case 'writer' :
                    case 'primcast' :
                        // const personList = ['Person One', 'Person Two'];
                        const personList = sse.ssRead('blob')['persons'];
                        fieldDiv = simpleListField(artiIdIn,wrkFieldName,wrkFieldName,dataObjIn[wrkFieldName],personList);
                        edOuterDiv.appendChild(fieldDiv);
                        break;
                    case 'tags' :
                        // const personList = ['Person One', 'Person Two'];
                        const tagList = sse.ssRead('blob')['tags'];
                        fieldDiv = simpleListField(artiIdIn,wrkFieldName,wrkFieldName,dataObjIn[wrkFieldName],tagList);
                        edOuterDiv.appendChild(fieldDiv);
                        break;
                    case 'relorg' :
                        // const companyList = ['Company One', 'Company Two'];
                        const companyList = sse.ssRead('blob')['companies'];
                        fieldDiv = simpleListField(artiIdIn,wrkFieldName,wrkFieldName,dataObjIn[wrkFieldName],companyList);
                        edOuterDiv.appendChild(fieldDiv);
                        break;
                    case 'synopsis' :
                    case 'arbmeta' :
                        fieldDiv = simpleTextareaField(artiIdIn,wrkFieldName,wrkFieldName,dataObjIn[wrkFieldName]);
                        edOuterDiv.appendChild(fieldDiv);
                        break;
                    case 'majtype' :
                        var optList = ['movie','tvseries','tvepisode'];
                        fieldDiv = simpleSelectField(artiIdIn,wrkFieldName,wrkFieldName,dataObjIn[wrkFieldName],optList); // dataObjIn[wrkFieldName]
                        edOuterDiv.appendChild(fieldDiv);
                        break;
                    default:
                        console.log('renderArtifactEdit.cbFunc - fscking oops!  ' + wrkFieldName);
                        break;
                }
            }
            
            var editDiv = document.getElementById('structfeatureedit');
            editDiv.innerHTML = '';
            editDiv.appendChild(edOuterDiv);
            
            document.getElementById('structfeatureplayer').style.display = 'none';
            document.getElementById('structfeaturesearch').style.display = 'none';
            document.getElementById('structfeatureedit').style.display = 'block';
            
            //END of cbFunc 
        }
        const endpoint = '/rmvid/api/artifact/get';
        const payloadObj = {'artifactid':artiIdIn};
        this.genericApiCall(payloadObj,endpoint,cbFunc);
        //END OF renderArtifactEdit
    }
    postArtifactFieldEdit(deidIn,argObjIn){
        console.log('postArtifactFieldEdit ' + deidIn + ': ' + JSON.stringify(argObjIn));
        var wrkArtiId = deidIn.substring(0,36);
        var wrkFieldName = argObjIn['field'];
        var updateObj = {};
        //udpateObj['artifactid'] = wrkArtiId;
        switch (wrkFieldName) {
            case 'artifactid':
                console.log('postArtifactFieldEdit - ' + wrkFieldName + ': we should never be here');
                break;
            case 'title' :
            case 'runmins' :
            case 'season' :
            case 'episode' :
            case 'file' :
            case 'filepath' :
            case 'eidrid' :
            case 'imdbid' :
            case 'relyear' :
                console.log('postArtifactFieldEdit - ' + wrkFieldName + ': simpleTextField');
                var strValue = document.getElementById(deidIn).value;
                updateObj[wrkFieldName] = strValue;
                console.log(JSON.stringify(updateObj));
                break;
            case 'director' :
            case 'writer' :
            case 'primcast' :
                console.log('postArtifactFieldEdit - ' + wrkFieldName + ': simpleListField');
                var strValue = document.getElementById(deidIn).value;
                updateObj[wrkFieldName] = JSON.parse(strValue);
                console.log(JSON.stringify(updateObj));
                break;
            case 'relorg' :
                console.log('postArtifactFieldEdit - ' + wrkFieldName + ': simpleListField');
                var strValue = document.getElementById(deidIn).value;
                updateObj[wrkFieldName] = JSON.parse(strValue);
                console.log(JSON.stringify(updateObj));
                break;
            case 'synopsis' :
            case 'arbmeta' :
                console.log('postArtifactFieldEdit - ' + wrkFieldName + ': simpleTextareaField');
                var strValue = document.getElementById(deidIn).value;
                updateObj[wrkFieldName] = strValue;
                // updateObj[wrkFieldName] = strValue.replace(/'/g,"\'");
                console.log(JSON.stringify(updateObj));
                break;
            case 'majtype' :
                console.log('postArtifactFieldEdit - ' + wrkFieldName + ': simpleSelectField');
                break;
            case 'tags' :
                console.log('postArtifactFieldEdit - ' + wrkFieldName + ': simpleListField');
                var strValue = document.getElementById(deidIn).value;
                updateObj[wrkFieldName] = JSON.parse(strValue);
                console.log(JSON.stringify(updateObj));
                break;
            default:
                console.log('postArtifactFieldEdit - fscking oops!  ' + wrkFieldName);
                break;
        }
        // Now, we do exciting things.
        var cbFunc = function (dataObjIn) {
            console.log('postArtifactFieldEdit.cbFunc: ' + JSON.stringify(dataObjIn));
        }
        const endpoint = '/rmvid/api/artifact/update';
        const payload = {'artifactid':wrkArtiId,'values':updateObj};
        this.genericApiCall(payload,endpoint,cbFunc);
    }
}

function switchboard(actionIn,objIdIn,argObjIn) {
    var ml = new RMVodWebApp();
    
    switch (actionIn) {
        
        case "firstthing":
            //var ml = new RMVodWebApp();
            
            // Commenting out "base page layout", because we're doing 
            // a new layout, and working with the static HTML again 
            // for now
            
            // Let's try using "basePageLayout01" to help reduce what 
            // we're depending on in the static HTML page
            //ml.basePageLayout01();
            ml.basePageLayout02();
            
            ml.clockSet();

            
            ml.initStorage();
            var cbFunc = function () {
                var ml = new RMVodWebApp();
                ml.renderArtifactBlocksByTagApi('');
                //ml.renderSimpleSearchWidget();
                ml.renderStaticModernSearchWidget
            };
            ml.vodlibartilistget(cbFunc);
            ml.renderTitleDiv();
            
            ml.onloadOptions();
            
            ml.contCookieOnLoad();
            break;

        case 'simpleNamesList':  
            console.log("Getting simple list with tag " + objIdIn.toString());
            var tmpDiv = ml.renderArtifactBlocksByTag(objIdIn);
            document.getElementById('div01').appendChild(tmpDiv);
            break;        
            
        case "vodPlayTitle":
            ml.vodPlayTitleApi2(objIdIn); //vodPlayTitleApi2
            break;
            
        case "vodPlayNextTitle":
            ml.contCookieNaturalEnd();
            ml.vodPlayNextTitle(objIdIn);
            break;
            
        case 'tvsExpandEpisodes':
            var serDeetDivId = objIdIn +  '-sidelist-detail-outer';
            var epListDivId = objIdIn + '-sidelist-episode-list-outer';
            var dispState = document.getElementById(epListDivId).style.display;
            if (dispState == 'block') {
                document.getElementById(epListDivId).style.display = 'none';
                document.getElementById(epListDivId).innerHTML = '';
                document.getElementById(serDeetDivId).style.display = 'none';
                document.getElementById(serDeetDivId).innerHTML = '';
            } else {
                document.getElementById(epListDivId).style.display = 'block';
                ml.populateSeriesEpisodes(objIdIn);
                document.getElementById(serDeetDivId).style.display = 'block';
                //ml.populateArtifactDetails(objIdIn);
                //console.log("tvsExpandEpisodes - Trying to tvsDetailShowButton");
                ml.tvsDetailShowButton(objIdIn);
            }
            break;
        
        case "toggleDivViz":
            console.log("Trying to toggleDivViz: " + objIdIn);
            var dEl = document.getElementById(objIdIn);
            var dState = dEl.style.display;
            //console.log(dState);
            if (dState == 'none') {
                document.getElementById(objIdIn).style.display = 'block';
                if (objIdIn.includes('-reveal-container')) {
                    artiID = objIdIn.replace('-reveal-container','');
                    //ml.vodlibartiobjget(artiID);
                    //ml.renderArtifactDetail(artiID);
                    ml.renderArtifactDetailApi(artiID);
                    //console.log(artiID);
                } else if (objIdIn == 'big-search-container') {
                    ml.renderAdvSearch();
                }
            } else {
                document.getElementById(objIdIn).style.display = 'none';
            }
            break;
            
        case 'xpopsldetail' :
            deid = objIdIn + '-sidelist-detail-outer';
            var deObj = document.getElementById(deid);
            var dispState = deObj.style.display;
            if (dispState == 'block') {
                deObj.style.display = 'none';
            } else {
                deObj.style.display = 'block';
                ml.populateArtifactDetails(objIdIn);
            }
            break;
        case 'xpopslseriesdetail' :
            deid = objIdIn + '-sidelist-detail-outer';
            var deObj = document.getElementById(deid);
            var dispState = deObj.style.display;
            ml.populateArtifactDetails(objIdIn);
            break;
        
        case 'execTagSearch' :
            tagVal = document.getElementById(objIdIn).value;
            ml.execSearchSingleFactor('tag',{'tag':tagVal});
            break;   
            
        case 'execTxtSrch' :
            console.log("Trying to execTxtSrch: " + objIdIn);
            var srchBoxDE = document.getElementById(objIdIn);
            console.log("execTxtSrch for " + srchBoxDE.value);
            ml.execSearchSingleFactor('text',{'text':srchBoxDE.value});
            srchBoxDE.value = "";
            break;
            
        case 'execMajTypSrch':
            console.log("Trying to " + actionIn + ": " + objIdIn, JSON.stringify(argObjIn)); 
            var mtVal = document.getElementById(objIdIn).value;
            console.log(objIdIn + " has value " + mtVal);
            ml.execSearchSingleFactor('majtype',{'majtype':mtVal});
            break;
        case 'execRelyearSrch':
            console.log("Trying to " + actionIn + ": " + objIdIn, JSON.stringify(argObjIn)); 
            var ryVal2 = document.getElementById(objIdIn).value;
            document.getElementById(objIdIn).value = "";
            var ryVal1 = document.getElementById('relyear-srch-start').value;
            document.getElementById('relyear-srch-start').value = "";
            console.log('Dates captured: ', ryVal1, ryVal2); //objIdIn + " has value " + mtVal);
            ml.execSearchSingleFactor('relyear',{'relyear1':ryVal1,'relyear2':ryVal2});
            break;
            
        case 'execWhereClauseSrch':
            //thing
            console.log("Trying to " + actionIn + ": " + objIdIn, JSON.stringify(argObjIn)); 
            const re = /'/g;
            var rawWCStr = document.getElementById(objIdIn).value.replace(re,"\'");
            //console.log("Value: " + rawWCStr);
            ml.execSearchSingleFactor('whereclause',{'whereclause':rawWCStr});
            break;
            
        case 'execDirectStringSrch' :
            ml.execSearchSingleFactor('text',{'text':argObjIn['srchstr']});
            break;
        
        case 'execAdvSrch' :
            ml.execAdvancedSearch();
            break;
            
        case 'initiateArtiEdit':
            ml.renderArtifactEdit(objIdIn);
            
            document.getElementById('tabspan2').click();
            
            break;
            
        case 'exposePlayer':
            document.getElementById('structfeatureedit').style.display = 'none';
            document.getElementById('structfeaturesearch').style.display = 'none';
            document.getElementById('structfeatureplayer').style.display = 'block';
            break;
            
        case 'updateArtifactField' :
            // console.log(actionIn + ', ' + objIdIn + ', ' + JSON.stringify(argObjIn));
            ml.postArtifactFieldEdit(objIdIn,argObjIn);
            break;
            
        case 'appendArtifactFieldList' :
            console.log(actionIn + ', ' + objIdIn + ', ' + JSON.stringify(argObjIn));
            
            // appendArtifactFieldList, 1a2d3dbc-20fa-4ba7-a2b6-3e788302f807-edit-director-value-slist, {"listfield":"1a2d3dbc-20fa-4ba7-a2b6-3e788302f807-edit-director-value"}            
            var listTA = document.getElementById(argObjIn['listfield']);
            //console.log(listTA.value);
            var newValDE = document.getElementById(objIdIn);
            var listAry = JSON.parse(listTA.value);
            var newVal = newValDE.value;
            if (listAry.indexOf(newVal) < 0) {
                listAry.push(newVal);
                // Clear "string" value from list if present
                const strIdx = listAry.indexOf("string");
                if (strIdx > -1) {
                    listAry.splice(strIdx,1);
                }
                listTA.value = JSON.stringify(listAry);
                listTA.onchange();
                //console.log(JSON.stringify(listAry));
            }
            break;
            
        case 'checkboxChange':
            //console.log(actionIn + ', ' + objIdIn + ', ' + JSON.stringify(argObjIn));
            // cbDE.onchange = "switchboard('checkboxChange','" + optNm + "',{})"
            const cookieNm = 'opt_' + objIdIn;
            const cookieVal = document.getElementById(objIdIn).checked;
            //console.log('Checkbox value for ' + objIdIn + ': ' + cookieVal);
            ml.cc.setCookie(cookieNm,cookieVal,365);
            //console.log('Verify cookie value for ' + cookieNm + ': ' + ml.cc.getCookie(cookieNm));
            break;
            
        case "tabPick":
            var lu = {};
            lu['tabspan0'] = 'structfeatureplayer';
            lu['tabspan1'] = 'structfeaturesearch';
            lu['tabspan2'] = 'structfeatureedit';
            lu['tabspan3'] = 'structfeaturesettings';
            
            var selTabSpan = document.getElementById(objIdIn);
            var selTab = selTabSpan.parentElement;
            var selStruct = document.getElementById(lu[objIdIn]);
            var parChildren = selTab.parentElement.children;
            for (var i=0; i < parChildren.length; i++) { 
                var tab = parChildren[i];
                if (tab.id == selTab.id) {
                    // SHOW
                    tab.className = "tab-sel";
                    var tabChildren = tab.children;
                    for (var j = 0 ; j < tabChildren.length; j++ ) { 
                        var tabChild = tabChildren[j];
                        tabChild.className = "tab-sel";
                    }
                    document.getElementById(lu[objIdIn]).style.display = "block";
                } else {
                    // HIDE
                    tab.className = "tab-unsel";
                    var tabChildren = tab.children;
                    for (var j = 0 ; j < tabChildren.length; j++ ) { 
                        var tabChild = tabChildren[j];
                        tabChild.className = "tab-unsel";
                    }
                    var structId = lu[tabChildren[0].id]
                    document.getElementById(structId).style.display = "none";
                }
            }
            break;
            
            
            
            
        
        /* 
         * Oh no... we should never get here!
         * */
        default:
            var xcStr = 'Action ' + actionIn + ' is not recognized!  ';
            xcStr += 'Received objIdIn = ' + objIdIn + '  and ';
            xcStr += 'argObjIn = ' + JSON.stringify(argObjIn) + '.';
            // throw 'Action ' + actionIn + ' is not recognized!';       
            throw xcStr; 
    }
}

function pbEnded (artiIdIn) {
    console.log('The playback it has ended');
    switchboard('vodPlayNextTitle',artiIdIn,{});
}   


 
/*  
mastercont     // The outermost div
headercont     // the container div for the header bar
bigbusiness    // The container for the main portion of the window
featurecont    // The container for the left portion of bigbusiness  where the player lives
listcontainer  // The container for the artifact list on the left

sizeStep -- div sizing should be done in steps based on the size of the window

1024x768
1280x768
1920x1080

*/
