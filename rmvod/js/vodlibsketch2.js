/*
 * Javascript for VodLib Static 2
 * 
 * */
 
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
        
        this.renderSimpleSearchWidget();
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
            var playerHeight = 350;
            var playerWidth = parseInt(playerHeight * playerAR);
            
            var srcURI = '/rmvid/vidsrc/' + artiDir + '/' + artiFil ;
            
            
            var playerHTML = '';
            playerHTML += '<div style="width:660px;height:360px;vertical-align:center;horizontal-align:center;margin:20px;">';
            playerHTML += '<video id="actualvideoplayer" width=' + playerWidth.toString() + ' height=' + playerHeight.toString() + ' style="vertical-align:top;horizontal-align:center;" autoplay=true controls=true>';
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
            
            var newContentDiv = wa.renderArtifactDetailApi(artiIdIn);
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
    
    renderSimpleSearchWidget(){
        var cbFunc = function(){
            var sse = new RMSSSEnhanced();
            var tagList = sse.ssRead('blob')['tags']
            var tmpHtml = '';
            tmpHtml += '<select style="font-family:arial;font-size:18px;" id="tag-search-select" name="tag-search-select" onchange="switchboard(\'execTagSearch\',\'tag-search-select\',{})">';
            tmpHtml += '<option value="">' + 'None' +  '</option>';
            for (var idx=0; idx<tagList.length; idx++ ){
                tmpHtml += '<option value="' + tagList[idx] + '">' + tagList[idx] +  '</option>';
            }
            tmpHtml += '</select>';
            tmpHtml += '<br>';
            tmpHtml += ' <span onclick="switchboard(\'toggleDivViz\',\'big-search-container\',{})"><b><u>AdvSrch</u></b></span>'
            var srchDiv = document.createElement('div');
            srchDiv.innerHTML = tmpHtml;
            try {
                //  headerblock2
                //document.getElementById('simple-search-div').innerHTML = '';
                //document.getElementById('simple-search-div').appendChild(srchDiv);
                document.getElementById('headerblock2').innerHTML = '';
                document.getElementById('headerblock2').appendChild(srchDiv);
            } catch (e) {
                console.log('headerblock2 not available yet. ' + e);
            }
        }
        this.vodlibtaglistget(cbFunc);
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
        var trunclength = 32;
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
        
        var trunclength = 27;
        if (tdTitle.length >= trunclength) {
            titleDiv.innerHTML = '<span class="' + tdSpanClass + '" onclick="' + tdSpanOnclick + '"><b><u>' + tdTitle.substring(0,(trunclength-3)) + '...(series)</u></b></span>';
        } else {
            titleDiv.innerHTML = '<span class="' + tdSpanClass + '" onclick="' + tdSpanOnclick + '"><b><u>' + tdTitle + '(series)</u></b></span>';
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
        
        var trunclength = 29;
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
            // console.log(JSON.stringify(objIn));
            
            // console.log('populateArtifactDetails - Received: ' + JSON.stringify(objIn))
            //const colList = ['title','majtype','runmins','season','episode','synopsis','file','filepath','director','writer','primcast','relorg','relyear','eidrid','imdbid','arbmeta','artifactid','tags'];
            const colList = ['title','majtype','relyear','tags','synopsis','runmins','director','writer','primcast','relorg','season','episode','file','filepath','eidrid','imdbid','arbmeta','artifactid'];
            var dValStr = "" ;
            for ( var idx=0; idx<colList.length; idx++ ) {
                //artifactid
                dValStr += '<b>' + colList[idx] + ": </b>" + objIn[colList[idx]] + '<br>';
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
        //console.log("tvsDetailShowButton - START: " + artiIdIn);
        var innerHtml = '';
        innerHtml += '<span class="" id="" style="font-size:10px;"';
        innerHtml += 'onclick="switchboard(\'xpopslseriesdetail\',\'' + artiIdIn + '\',{})" ';
        
        innerHtml += '>'; // initiateArtiEdit
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
    renderArtifactBlocksByTag(tagStrIn){
        var artiIdList = [];
        var theBlob = this.sse.ssRead('blob');
        if ((tagStrIn == undefined) || (tagStrIn == '')) {
            var tmpArtiObj = theBlob['artifacts'];
            artiIdList = Object.keys(tmpArtiObj);
        } else {
            artiIdList = theBlob['t2a'][tagStrIn]; 
        }
        var tmpDiv = this.renderArtifactBlocksByIdList(artiIdList);
        return tmpDiv;
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
            // renderArtifactDetailBox
            var newContentDiv = wa.renderArtifactDetailBox(objIn);
            document.getElementById("structfeatureplayer").appendChild(newContentDiv);
        }
        const endpoint = '/rmvid/api/artifact/get';
        const payload = {'artifactid':artiIdIn};
        this.genericApiCall(payload,endpoint,cbFunc);
    }
    renderArtifactDetail(artIdIn){
        
        //  ml.vodlibartiobjget(artiID);
        
        
        ////console.log(artIdIn);
        //var theBlob = this.sse.ssRead('blob');
        ////console.log(JSON.stringify(theBlob));
        //var artiObj = theBlob['artifacts'][artIdIn];
        ////console.log(JSON.stringify(artiObj));
        //var keysList = Object.keys(artiObj);
        ////console.log(JSON.stringify(keysList));
        
        //// Create "Detail Display Block" div
        //var divInitialDisplay = document.createElement('div');
        //divInitialDisplay.className = "artifact-default-disp-row";
        ////divInitialDisplay.style = "display:inline-flex;";    
        //divInitialDisplay.style = "display:block;";    
        
        //var tmpRow = document.createElement('div');
        //tmpRow.style = "display:block;";   
        //var divRow1 = document.createElement('div');
        //divRow1.className = "artifact-default-disp-row";
        //divRow1.style = "display:inline-flex;";   
        //var divRow1C1 = document.createElement('div');
        //divRow1C1.className = "artifact-default-disp-cell";
        //divRow1C1.style = "display:inline-flex;"; 
        //divRow1C1.innerHTML = "<b>Director(s):</b>";
        //divRow1.appendChild(divRow1C1);
        //var divRow1C2 = document.createElement('div');
        //divRow1C2.className = "artifact-default-disp-cell";
        //divRow1C2.style = "display:block;"; 
        //divRow1C2.innerText = JSON.stringify(artiObj['director']);
        //divRow1.appendChild(divRow1C2);
        //tmpRow.appendChild(divRow1);
        ////divInitialDisplay.appendChild(divRow1);
        //divInitialDisplay.appendChild(tmpRow);
 
        //var tmpRow = document.createElement('div');
        //tmpRow.style = "display:block;";   
        //var divRow2 = document.createElement('div');
        //divRow2.className = "artifact-default-disp-row";
        //divRow2.style = "display:inline-flex;";   
        //var divRow2C1 = document.createElement('div');
        //divRow2C1.className = "artifact-default-disp-cell";
        //divRow2C1.style = "display:inline-flex;"; 
        //divRow2C1.innerHTML = "<b>Writer(s):</b>";
        //divRow2.appendChild(divRow2C1);
        //var divRow2C2 = document.createElement('div');
        //divRow2C2.className = "artifact-default-disp-cell";
        //divRow2C2.style = "display:block;"; 
        //divRow2C2.innerText = JSON.stringify(artiObj['writer']);
        //divRow2.appendChild(divRow2C2);
        //tmpRow.appendChild(divRow2);
        ////divInitialDisplay.appendChild(divRow2);
        //divInitialDisplay.appendChild(tmpRow);

        //var tmpRow = document.createElement('div');
        //tmpRow.style = "display:block;";   
        //var divRow3 = document.createElement('div');
        //divRow3.className = "artifact-default-disp-row";
        //divRow3.style = "display:inline-flex;";   
        //var divRow3C1 = document.createElement('div');
        //divRow3C1.className = "artifact-default-disp-cell";
        //divRow3C1.style = "display:inline-flex;"; 
        //divRow3C1.innerHTML = "<b>Cast:</b>";
        //divRow3.appendChild(divRow3C1);
        //var divRow3C2 = document.createElement('div');
        //divRow3C2.className = "artifact-default-disp-cell";
        //divRow3C2.style = "display:block;"; 
        //divRow3C2.innerText = JSON.stringify(artiObj['primcast']);
        //divRow3.appendChild(divRow3C2);
        //tmpRow.appendChild(divRow3);
        ////divInitialDisplay.appendChild(divRow3);
        //divInitialDisplay.appendChild(tmpRow);


        //var tmpRow = document.createElement('div');
        //tmpRow.style = "display:block;";   
        //var divRow4 = document.createElement('div');
        //divRow4.className = "artifact-default-disp-row";
        //divRow4.style = "display:inline-flex;";   
        //var divRow4C1 = document.createElement('div');
        //divRow4C1.className = "artifact-default-disp-cell";
        //divRow4C1.style = "display:inline-flex;"; 
        //divRow4C1.innerHTML = "<b>Tags:</b>";
        //divRow4.appendChild(divRow4C1);
        //var divRow4C2 = document.createElement('div');
        //divRow4C2.className = "artifact-default-disp-cell";
        //divRow4C2.style = "display:block;"; 
        ////divRow4C2.innerText = JSON.stringify(artiObj['primcast']);
        //divRow4C2.innerText = JSON.stringify(theBlob['a2t'][artIdIn]);
        //divRow4.appendChild(divRow4C2);
        //tmpRow.appendChild(divRow4);
        ////divInitialDisplay.appendChild(divRow3);
        //divInitialDisplay.appendChild(tmpRow);



        //var tmpRow = document.createElement('div');
        //tmpRow.style = "display:block;";   
        //var divRow5 = document.createElement('div');
        //divRow5.className = "artifact-default-disp-row";
        //divRow5.style = "display:inline-flex;";   
        //var divRow5C1 = document.createElement('div');
        //divRow5C1.className = "artifact-default-disp-cell";
        //divRow5C1.style = "display:inline-flex;"; 
        ////divRow5C1.innerHTML = "<b>Tags:</b>";
        //divRow5C1.innerText = "Artifact JSON:\n" + JSON.stringify(theBlob['artifacts'][artIdIn]);
        //divRow5.appendChild(divRow5C1);
        ////var divRow4C2 = document.createElement('div');
        ////divRow4C2.className = "artifact-default-disp-cell";
        ////divRow4C2.style = "display:block;"; 
        //////divRow4C2.innerText = JSON.stringify(artiObj['primcast']);
        ////divRow4C2.innerText = JSON.stringify(theBlob['a2t'][artIdIn]);
        ////divRow4.appendChild(divRow4C2);
        //tmpRow.appendChild(divRow5);
        ////divInitialDisplay.appendChild(divRow3);
        //divInitialDisplay.appendChild(tmpRow);


        var newContentDiv = this.renderArtifactDetailNEW(artIdIn,'ro')
        
        var outerDiv = document.getElementById(artIdIn+ '-reveal-container');
        outerDiv.innerHTML = '';
        //outerDiv.appendChild(divInitialDisplay);
        outerDiv.appendChild(newContentDiv);

//{"artifactid":"e5f439d8-ff70-45df-b2eb-2cd475ebfbe5","title":"War Games","majtype":"movie","runmins":114,"season":-1,"episode":-1,"file":"WarGames.m4v","filepath":"drama","director":["John Badham"],"writer":["Lawrence Lasker","Walter F. Parkes"],"primcast":["Matthew Broderick","Dabney Coleman","John Wood","Ally Sheedy"],"relorg":["MGM/UA Entertainment Company"],"relyear":1983,"eidrid":"string","imdbid":"tt0086567","arbmeta":{"string":"string"}}
        
//    # <tr style="background-color:#dddddd">
//        # <td colspan="6">Director List</td>
//    # </tr>
//    # <tr style="background-color:#dddddd">
//        # <td colspan="6">Writer List</td>
//    # </tr>
//    # <tr style="background-color:#dddddd">
//        # <td colspan="6">Cast List</td>
//    # </tr>
//    # <tr style="background-color:#dddddd">
//        # <td colspan="5">Tags List</td>
//        # <td colspan="1">Tag Edit button</td>
//    # </tr>
//    # <tr style="background-color:#dddddd">
//        # <td colspan="5">%nbsp;</td>
//        # <td colspan="1">Edit Artifact button</td>                
    
    
    }
    renderArtifactDetailBox(artiObj){
        //var artiObj = this.sse.ssRead('blob')['artifacts'][artiIdIn];
        //console.log("renderArtifactDetailBox - " + JSON.stringify(artiObj));
        
        
        function row_1s3 (labelListIn,valueListIn) {
            var tmpStr = '<tr><td class="common" height="13" alight="left"><span class="fieldlabel">' + labelListIn[0]+ ':</span></td>';
            //tmpStr += '<td class="common" height="13" alight="left" colspan=3><span class="fieldvalue">'; //  style="word-wrap: break-word; word-break: break-all;"
            tmpStr += '<td class="common" height="13" alight="left" colspan=3><div style="width: 525px;"><span class="fieldvalue">'; //  style="word-wrap: break-word; word-break: break-all;"
            //rowStr += artiObj['title'];
            tmpStr += valueListIn[0];
            //tmpStr += '</span></td></tr>';
            tmpStr += '</span></div></td></tr>';
            return tmpStr;
        }
        
        function row_1111 (labelListIn,valueListIn) {
            var tmpStr = '<tr><td class="common" height="13" alight="left"><span class="fieldlabel">' + labelListIn[0] + '</span></td>';
            tmpStr += '<td class="common" height="13" alight="left"><span class="fieldvalue">';
            tmpStr += valueListIn[0];
            tmpStr += '</td><td class="common" align="left"><span class="fieldlabel">' + labelListIn[1] + '</span></td>';
            tmpStr += '<td class="common" height="13" alight="left"><span class="fieldvalue">';
            tmpStr += valueListIn[1];
            tmpStr += '</td></tr>';
            return tmpStr;
        }
        
        var rowStrList = [];
        var rowStr = '';
        // Row 1 HTML -- Title
        rowStr = '<tr><td class="common" colspan=4 height="13" alight="left"><span class="artideettitle" style="font-size:16px;"><b>';
        rowStr += artiObj['title'];
        rowStr += '</b></span></td></tr>';
        rowStrList.push(rowStr);
        if (artiObj['majtype'] == 'tvepisode') {
            // Row 2 HTML - TV Series Title (optional)
            rowStrList.push(row_1s3(['TV Series'],['Series Title']));
            // Row 3 HTML - TV Series Season & Episode
            rowStrList.push(row_1111(['Season','Episode'],[artiObj['season'],artiObj['episode']]));
        }
        // Row 3.5 HTML - Synopsis
        rowStrList.push(row_1s3(['Synopsis'],[artiObj['synopsis']]));
        // Row 5 HTML - Writer list
        rowStrList.push(row_1s3(['Writer(s)'],[JSON.stringify(artiObj['writer'])]));
        // Row 6 HTML - Director list
        rowStrList.push(row_1s3(['Director(s)'],[JSON.stringify(artiObj['director'])]));
        // Row 7 HTML - Primary Cast list
        rowStrList.push(row_1s3(['Pimary Cast'],[JSON.stringify(artiObj['primcast'])]));
        // Row 8 HTML - Runtime & Release Year
        rowStrList.push(row_1111(['Runtime(m)','Release Yr.'],[artiObj['runmins'],artiObj['relyear']]));
        // Row 9 HTML - Reference Site IDs
        rowStrList.push(row_1111(['eidrid','imdbid'],[artiObj['eidrid'],artiObj['imdbid']]));
        // Row 10 HTML - Tags
        rowStrList.push(row_1s3(['Tags'],artiObj['tags']));
        // Row 4 HTML - File params
        rowStrList.push(row_1111(['Filepath','Filename'],[artiObj['filepath'],artiObj['file']]));
        // Row 11 HTML - Arbitrary Metadata
        rowStrList.push(row_1s3(['Metadata'],[JSON.stringify(artiObj['arbmeta'])]));
        // Row 12 HTML - Artifact ID
        rowStrList.push(row_1s3(['Artifact ID'],[JSON.stringify(artiObj['artifactid'])]));
        
        var innerHtmlStr = '<table cellspacing="0" border="0" width="688"><colgroup span="4" width="170"></colgroup>';
        
        for (var idx=0; idx<rowStrList.length; idx++) {
            innerHtmlStr += rowStrList[idx];
        }
        
        innerHtmlStr += '</table>';
        
        //console.log(innerHtmlStr);
        //console.log(innerHtmlStr);
        var theDiv = document.createElement('div');
        theDiv.className = 'artideetcontainer';
        theDiv.innerHTML = innerHtmlStr;
        return theDiv;
    }
    renderArtifactDetailNEW(artiIdIn,modeIn){
        var artiObj = this.sse.ssRead('blob')['artifacts'][artiIdIn];
        
        function row_1s3 (labelListIn,valueListIn) {
            var tmpStr = '<tr><td class="common" height="13" alight="left"><span class="fieldlabel">' + labelListIn[0]+ ':</span></td>';
            tmpStr += '<td class="common" height="13" alight="left" colspan=3><span class="fieldvalue">';
            tmpStr += valueListIn[0];
            tmpStr += '</span></td></tr>';
            return tmpStr;
        }
        
        function row_1111 (labelListIn,valueListIn) {
            var tmpStr = '<tr><td class="common" height="13" alight="left"><span class="fieldlabel">' + labelListIn[0] + '</span></td>';
            tmpStr += '<td class="common" height="13" alight="left"><span class="fieldvalue">';
            tmpStr += valueListIn[0];
            tmpStr += '</td><td class="common" align="left"><span class="fieldlabel">' + labelListIn[1] + '</span></td>';
            tmpStr += '<td class="common" height="13" alight="left"><span class="fieldvalue">';
            tmpStr += valueListIn[1];
            tmpStr += '</td></tr>';
            return tmpStr;
        }
        
        var rowStrList = [];
        var rowStr = '';
        // Row 1 HTML -- Title
        rowStr = '<tr><td class="common" colspan=4 height="13" alight="left"><span class="artideettitle">';
        rowStr += artiObj['title'];
        rowStr += '</span></td></tr>';
        rowStrList.push(rowStr);
        // Row 2 HTML - TV Series Title (optional)
        rowStrList.push(row_1s3(['TV Series'],['Series Title']));
        // Row 3 HTML - TV Series Season & Episode
        rowStrList.push(row_1111(['Season','Episode'],[artiObj['season'],artiObj['episode']]));
        // Row 4 HTML - File params
        rowStrList.push(row_1111(['Filepath','Filename'],[artiObj['filepath'],artiObj['file']]));
        // Row 5 HTML - Writer list
        rowStrList.push(row_1s3(['Writer(s)'],[JSON.stringify(artiObj['writer'])]));
        // Row 6 HTML - Director list
        rowStrList.push(row_1s3(['Director(s)'],[JSON.stringify(artiObj['director'])]));
        // Row 7 HTML - Primary Cast list
       rowStrList.push(row_1s3(['Pimary Cast'],[JSON.stringify(artiObj['primcast'])]));
        // Row 8 HTML - Runtime & Release Year
        rowStrList.push(row_1111(['Runtime(m)','Release Yr.'],[artiObj['runmins'],artiObj['relyear']]));
        // Row 9 HTML - Reference Site IDs
        rowStrList.push(row_1111(['eidrid','imdbid'],[artiObj['eidrid'],artiObj['imdbid']]));
        // Row 10 HTML - Tags
        rowStrList.push(row_1s3(['Tags'],['Tags would go here']));
        // Row 11 HTML - Arbitrary Metadata
        rowStrList.push(row_1s3(['Metadata'],[JSON.stringify(artiObj['arbmeta'])]));
        // Row 12 HTML - Artifact ID
        rowStrList.push(row_1s3(['Artifact ID'],[JSON.stringify(artiObj['artifactid'])]));
        
        var innerHtmlStr = '<table cellspacing="0" border="0"><colgroup span="4" width="170"></colgroup>';
        
        for (var idx=0; idx<rowStrList.length; idx++) {
            innerHtmlStr += rowStrList[idx];
        }
        
        innerHtmlStr += '</table>';
        
        var theDiv = document.createElement('div');
        theDiv.className = 'artideetcontainer';
        theDiv.innerHTML = innerHtmlStr;
        return theDiv;
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
            ml.initStorage();
            var cbFunc = function () {
                var ml = new RMVodWebApp();
                ml.renderArtifactBlocksByTagApi('');
                ml.renderSimpleSearchWidget();
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
            ml.renderArtifactBlocksByTagApi(tagVal);
            break;    
        case 'execAdvSrch' :
            ml.execAdvancedSearch();
            break;
            
        case 'initiateArtiEdit':
            ml.renderArtifactEdit(objIdIn);
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
            
            
            
        
        /* 
         * Oh no... we should never get here!
         * */
        default:
            throw 'Action ' + actionIn + ' is not recognized!';        
    }
}

function pbEnded (artiIdIn) {
    console.log('The playback it has ended');
    switchboard('vodPlayNextTitle',artiIdIn,{});
}   
