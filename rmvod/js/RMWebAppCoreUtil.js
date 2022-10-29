
//RMWebAppCoreUtil.js  Copyright 2022 Paul Tourville

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


// A common logging utility class
class RMLogUtil {
    constructor (classNmIn,threshLvlIn) {
        this.classNm = 'CNS';
        this.threshLvl = 3;
        this.logCnt = 0;
        if (typeof classNmIn == 'string') {
            if (classNmIn.length > 0) {
                this.classNm = classNmIn;
            }
        }
        if (typeof threshLvlIn == 'number') {
            if (threshLvlIn >= 0) {
                this.threshLvl = parseInt(threshLvlIn);
            }
        }
    }
    setClassNm(classNmIn) {
        if (typeof classNmIn == 'string') {
            if (classNmIn.length > 0) {
                this.classNm = classNmIn;
            }
        }
    }
    setThreshLvl(lvlIn) {
        if (typeof lvlIn == 'number') {
            if ((lvlIn >= 0) && (lvlIn <= 7)) {
                this.threshLvl = parseInt(lvlIn);
            }
        }
    }
    logLim (msgIn,lvlIn) {
        this.log('MNS',msgIn,lvlIn);
    }
    log (methNmIn,msgIn,lvlIn) {
        this.logCnt++;
        if (lvlIn <= this.threshLvl) {
            console.log(this.classNm + '.' + methNmIn + ' (' + this.logCnt + ') - ' + msgIn);
        }
    }
}
// A general utility class which leverages RMLogUtil and other functionality
class RMSuperUtil {
    constructor() {
        // Setup internal logger
        this.iLogger = new RMLogUtil('RMSuperUtil',2);
        
    }
    __throwEx (methNmIn,msgIn) {
        this.iLog('__throwEx',methNmIn + ': ' + msgIn,1);
    }
    setupLogger(classNmIn,threshLvlIn){
        this.xLogger = new RMLogUtil(classNmIn,threshLvlIn);
    }
    // logLim and log are methods which should be used by the external caller
    logLim(msgIn,lvlIn) {
        try {
            this.xLogger.logLim(msgIn,lvlIn);
        } catch (e) {
            throw e;
        }
    }
    log(methNmIn,msgIn,lvlIn) {
        try {
            this.xLogger.log(methNmIn,msgIn,lvlIn);
        }catch (e) {
            throw e;
        }
    }
    // iLog is the internal logger for RMSuperUtil
    iLog(methNmIn,msgIn,lvlIn) {
        this.iLogger.log(methNmIn,msgIn,lvlIn);
    }
    buildEventListeners (elObjIn) {
        var methNm = 'buildEventListeners - ';
        var elKeyList = [];
        var elObj = {};
        //      HEY, STUPID!!!
        //  SO, THIS SHOULD BE ABLE TO TAKE AN ARGUMENT OF AN OBJECT 
        // CONTAINING KVPs OF event:function AND ITERATE OVER THAT.  
        // IF NO ARG PROVIDED, USE this.defObj.elfuncs
        if (elObjIn != undefined) {
            if (typeof elObjIn == 'object') {
                elKeyList  = Object.keys(elObjIn);
                elObj = elObjIn;
                //this.logger(methNm + 'elObjIn is an object.  Using: ' + JSON.stringify(elObj),2);
            } else {
                this.__throwEx(methNm,"elObjIn supplied is not an Object");
                return;
            }
        } else { 
            this.__throwEx(methNm,'elObjIn not provided');
        }
                
        // Not sure if this should add event listeners to an existing 
        // element (e.g. document.getElementById('foo').addEventListener()) 
        // or just add them as strings in the HTML.
        // Either way, we'll have to iterate over elfuncs key in defObjIn
        // to build them.
        
        
        //  WE'RE GOING TO IGNORE PERMITTED EVENT LISTENERS.  JUST ASSUME THE CALLER IS SANE FOR NOW
        
        var retStr = '';
        var pelIdx = parseInt(0);
        var keyList = Object.keys(elObjIn);
        var maxIdx = keyList.length;
        
        for (pelIdx=0;pelIdx<maxIdx;pelIdx++) {
            var tmpKey = keyList[pelIdx];
            if (elObj.hasOwnProperty(tmpKey)) {
                if (elObj[tmpKey] != undefined) {
                    var tmpel = ' ' + tmpKey.toString() + '="' + elObj[tmpKey].toString() + '" '; 
                    retStr += tmpel;
                } else {
                }
            } else {
            }
        }
        return retStr;
    }
    disposeHtmlResult (htmlContStrIn,modeIn,targetIdIn) {
        // THE FOLLOWING SHOULD BE STANDARD ACROSS PRACTICALLY ALL CONTROLS
        // elfuncs: object whose keys are Event Listener names and values are strings defining action to be taken (e.g. a function call)
        // docelid: string containing the "id" the element should have
        // docelclass: string containing the css class to use
        // docelstype: string containing the local css style to use
        // docelparentid: string containing the "id" the element to contain this element
        // docelinsertmode: one of ['replaceparentinner','replacethisid','appendparentinner','insertafterid','insertbeforeid','returnhtml']
        
        // Just renaming inputs, since this was lefted from somewhere else...
        var retStr = htmlContStrIn;
        var mode = 'returnhtml';
        var targetId = '';
        if (modeIn =! undefined) {
            mode = modeIn;
            targetId = targetIdIn;
        }
        
        var retval = false;
        switch (mode) {
            case 'returnhtml':
                retval = retStr;
                break;
            case 'replaceparentinner':
                self.logger('Setting innerHTML of ' + this.defObj.docelparentid + ' to ' + retStr,3);
                document.getElementById(targetId).innerHTML = retStr;
                break;
            case 'replacethisid':
                // this may be garbage
                //document.getElementById(targetId) = retStr;
                document.getElementById(targetId).innerHTML = retStr;
                break;
            case 'appendparentinner':
                // This may also be garbage... may have to create a "node" from the html...?
                document.getElementById(targetId).appendChild(retStr);
                break;
            case 'insertafterid':
                self.logger(mode + ' not implemented.',3);
                break;
            case 'insertbeforeid':
                self.logger(mode + ' not implemented.',3);
                break;
            default:
                // If we don't recognize docelinsertmode or it is not 
                // provided, do same as returnhtml
                retval = retStr;
                break;
        }
        
        
        return retval;
    }
}
// A Common Session-Handling utility functions, depends on 
// RMSessionStoreUtil and RMSSSEnhanced
class RMSessionUtil {
    constructor(){
        this.sse = new RMSSSEnhanced();
        this.lu = new RMLogUtil('RMSessionUtil',5);
    }
    logger (methNmIn,msgIn,lvlIn) {
        this.lu.log(methNmIn,msgIn,lvlIn);
    }
    sGet () {
        var methNm = 'sGet';
        var retval = false;
        try {
            //sessObj = this.
            retval = this.sse.ssRead('localsession');
        } catch (e) {
            var newMsg = 'ERROR!  COULD NOT READ LOCAL SESSION! ' + JSON.stringify(e);
            this.logger(methNm,newMsg,3);
            throw newMsg;
        }
        return retval
    }
    sUpdate (udObjIn) {
        var methNm = 'sUpdate';
        throw "RMSessionUtil." + methNm + ": NOPE!";
    }
    sTOCheck () {
        // Caller should evaluate return value as follows:
        //  retval == -2 : Session evaluation did not complete properly - treat as bad session
        //  retval == -1 : Session evaluated as expired
        //  retval == 0 : Session is within the warn window, about to expire
        //  retval == 1 : Session is OK 
        var methNm = 'sTOCheck';
        var retval = -2;
        var sExpWarnSec = 60;
        var sObj = false;
        try {
            sObj = this.sGet();
        } catch (e) {
            var newMsg = 'ERROR!  COULD NOT READ LOCAL SESSION! ' + JSON.stringify(e);
            this.logger(methNm,newMsg,3);
            throw newMsg;
        }
        
        var newMsg = 'Have not evaluated session age yet.';
        var logLevel = 2;
        try {
            var d = new Date();
            var curEpoch = parseInt(d.getTime()/1000);
            
            var stRemain = parseInt(sObj.sexpire) - parseInt(curEpoch);
            
            if (stRemain <= 0) {
                // SESSION HAS EXPIRED
                retval = -1;
                newMsg = 'Local session expired.';
                logLevel = 3;
            } else if (stRemain <= sExpWarnSec) {
                // SESSION IS WITHIN THE WARN THRESHOLD
                retval = 0;
                newMsg = 'Local session within warn window';
                logLevel = 6;
            } else {
                // SESSION IS OK
                retval = 1;
                newMsg = 'Local session OK';
                logLevel = 6;
            }
        } catch (e) {
            newMsg = 'EXCEPTION!  Local session missing "sexpire": ' + JSON.stringify(e) + '; ' + JSON.stringify(sObj);
            this.logger(methNm,newMsg,3);
            throw newMsg;
        }
        this.logger(methNm,newMsg,logLevel);
        return retval
    }
    sClose () {
        var methNm = 'sClose';
        throw "RMSessionUtil." + methNm + ": NOPE!";
    }
}

// A common set of utility functions for doing DOM things in a standardized way
class RMDOMUtil {
    constructor() {
        this.lu = new RMLogUtil('RMSessionUtil',5);
        this.ll = {};
        this.ll['emerg'] = 1;
        this.ll['alert'] = 2;
        this.ll['crit'] = 3;
        this.ll['err'] = 4;
        this.ll['warning'] = 5;
        this.ll['info'] = 6;
        this.ll['debug'] = 7;
    }
    logger (methNmIn,msgIn,lvlIn) {
        this.lu.log(methNmIn,msgIn,lvlIn);
    }
    scrollToBotton(divIdIn) {
        var methNm = 'scrollToBotton';
        var div = document.getElementById(divIdIn);
        div.scrollTop = div.scrollHeight - div.clientHeight;
        
    }
    
    
    
    
    
}


// Serves as a base class for classes which Return HTML for standard 
// Display Controls
// defObjIn contains KVPs for all the parameters which define the look 
// and behavior of the control.
// contObjIn contains KVPs for the initial content of the control
class RMBaseControl {
    constructor (defObjIn,contObjIn) {
        this.logUtil = new RMLogUtil('RMPCObjectContentView',3);
        this.defObj = defObjIn;
        this.contObj = contObjIn;
        this.sse = new RMSSSEnhanced();
        this.cfg = this.sse.ssRead('localcfg');
        this.classNm = this.constructor.name;
        this.llList = ['Panic','Emergency','Error','Warning','Debug','Info'];
        this.logLevel = 3;
        // THE FOLLOWING SHOULD BE STANDARD ACROSS PRACTICALLY ALL CONTROLS
        // elfuncs: object whose keys are Event Listener names and values are strings defining action to be taken (e.g. a function call)
        // docelid: string containing the "id" the element should have
        // docelclass: string containing the css class to use
        // docelstype: string containing the local css style to use
        // docelparentid: string containing the "id" the element to contain this element
        // docelinsertmode: one of ['replaceparentinner','replacethisid','appendparentinner','insertafterid','insertbeforeid','returnhtml']
        this.ctlKeyList = ['elfuncs','docelid','docelclass','docelstype','docelparentid','docelinsertmode'];
        this.permittedEventListeners = ['onclick','onblur','onchange','onload'];
    }
    logger(logMsgIn,lvlIn) {
        this.logUtil.logLim(logMsgIn,lvlIn);
    }
    loggerEnh(methNmIn,logMsgIn,lvlIn) {
        this.logUtil.log(methNmIn,logMsgIn,lvlIn);
    }
    __buildEventListeners (elObjIn) {
        var methNm = '__buildEventListeners - ';
        var elKeyList = [];
        var elObj = {};
        //      HEY, STUPID!!!
        //  SO, THIS SHOULD BE ABLE TO TAKE AN ARGUMENT OF AN OBJECT 
        // CONTAINING KVPs OF event:function AND ITERATE OVER THAT.  
        // IF NO ARG PROVIDED, USE this.defObj.elfuncs
        if (elObjIn != undefined) {
            if (typeof elObjIn == 'object') {
                elKeyList  = Object.keys(elObjIn);
                elObj = elObjIn;
            } else {
                if (this.defObj.elfuncs != 'undefined') {
                    if (typeof this.defObj.elfuncs == 'object') {
                        elKeyList  = Object.keys(this.defObj.elfuncs);
                        elObj = this.defObj.elfuncs;
                    } else {
                        this.logger(methNm + 'this.defObj.elfuncs is garbage - not an object',3);
                    }
                } else {
                    this.logger(methNm + 'elObjIn is not an object and this.defObj.elfuncs is undefined',3);
                    return '';
                }
            }
        } else { 
            this.logger(methNm + 'elObjIn is undefined',5);
            if (this.defObj.elfuncs != 'undefined') {
                if (typeof this.defObj.elfuncs == 'object') {
                    elKeyList  = Object.keys(this.defObj.elfuncs);
                    elObj = this.defObj.elfuncs;
                } else {
                    this.logger(methNm + 'this.defObj.elfuncs is garbage - not an object',4);
                }
            } else {
                this.logger(methNm + 'elObjIn is undefined and this.defObj.elfuncs is undefined',4);
                return '';
            }
        }
                
        // Not sure if this should add event listeners to an existing 
        // element (e.g. document.getElementById('foo').addEventListener()) 
        // or just add them as strings in the HTML.
        // Either way, we'll have to iterate over elfuncs key in defObjIn
        // to build them.
        
        //string-based route:
        var retStr = '';
        var pelIdx = parseInt(0);
        var maxIdx = parseInt(this.permittedEventListeners.length);
        if (pelIdx < maxIdx) {
        }
        
        for (pelIdx=0;pelIdx<maxIdx;pelIdx++) {
            var tmpKey = this.permittedEventListeners[pelIdx];
            if (elObj.hasOwnProperty(tmpKey)) {
                if (elObj[tmpKey] != undefined) {
                    var tmpel = ' ' + tmpKey.toString() + '="' + elObj[tmpKey].toString() + '" '; 
                    retStr += tmpel;
                } else {
                }
            } else {
            }
        }
        return retStr;
    }
    __disposeResult (retStr) {
        // THE FOLLOWING SHOULD BE STANDARD ACROSS PRACTICALLY ALL CONTROLS
        // elfuncs: object whose keys are Event Listener names and values are strings defining action to be taken (e.g. a function call)
        // docelid: string containing the "id" the element should have
        // docelclass: string containing the css class to use
        // docelstype: string containing the local css style to use
        // docelparentid: string containing the "id" the element to contain this element
        // docelinsertmode: one of ['replaceparentinner','replacethisid','appendparentinner','insertafterid','insertbeforeid','returnhtml']
        var retval = false;
        switch (this.defObj.docelinsertmode) {
            case 'returnhtml':
                retval = retStr;
                break;
            case 'replaceparentinner':
                self.logger('Setting innerHTML of ' + this.defObj.docelparentid + ' to ' + retStr,3);
                document.getElementById(this.defObj.docelparentid).innerHTML = retStr;
                break;
            case 'replacethisid':
                // this may be garbage
                document.getElementById(this.defObj.docelid).innerHTML = retStr;
                break;
            case 'appendparentinner':
                // This may also be garbage... may have to create a "node" from the html...?
                document.getElementById(this.defObj.docelparentid).appendChild(retStr);
                break;
            case 'insertafterid':
                self.logger(this.defObj.docelinsertmode + ' not implemented.',3);
                break;
            case 'insertbeforeid':
                self.logger(this.defObj.docelinsertmode + ' not implemented.',3);
                break;
            default:
                // If we don't recognize docelinsertmode or it is not 
                // provided, do same as returnhtml
                retval = retStr;
                break;
        }
        
        
        return retval;
    }
    render() {
        this.logger('render method called but not locally defined',3);
    }
}
// Serves as a base class for classes which Return HTML for standard 
// Display Controls
// defObjIn contains KVPs for all the parameters which define the look 
// and behavior of the control.
// contObjIn contains KVPs for the initial content of the control
class RMBaseDisplayControl extends RMBaseControl {
    constructor (defObjIn,contObjIn) {
        super(defObjIn,contObjIn);
        this.logUtil.setClassNm('RMBaseDisplayControl');
    }
}
// Standard control for displaying a List Object
class RMListDisplayControl extends RMBaseControl {
    constructor (defObjIn,contObjIn) {
        super(defObjIn,contObjIn);
        this.logUtil.setClassNm('RMListDisplayControl');
    }
    render () {

        var methNm = 'render - ';
        this.logger(methNm + "BEGIN!",5);
        var retval = '';
        retval += '<div  style="width:100%;display:block;">\n';
        var objFieldData = {};
        var objKeyList = [];
        if (this.contObj.hasOwnProperty('content')) {
            this.logger(methNm + 'typeof this.contObj["content"]: ' + typeof this.contObj['content'] + '; content: ' + JSON.stringify(this.contObj['content']),5);
            if ((typeof this.contObj['content'] == 'object')) {
                objFieldData = this.contObj['content'];
            }
        }
        
        for (var lIdx=0; lIdx<objFieldData.length; lIdx++) {
            var key = lIdx
            var value = objFieldData[lIdx];
            retval += '<p>';
            retval += '<span style="background-color:#dddddd;"><b>';
            retval += key;
            retval += ': </b> ';
            retval += value;
            retval += '</span>';
            retval += '</p>\n';
            }
        
        retval += '</div>\n';
        
        return retval;
    }
}
// Standard control for displaying a Dict Object
class RMDictDisplayControl extends RMBaseControl {
    constructor (defObjIn,contObjIn) {
        super(defObjIn,contObjIn);
        this.logUtil.setClassNm('RMDictDisplayControl');
    }
    render () {
        var methNm = 'render_derived - ';
        this.logger(methNm + "BEGIN!",5);
        var retval = '';
        retval += '<div  style="width:100%;display:block;">\n';
        var objFieldData = {};
        var objKeyList = [];
        if (this.contObj.hasOwnProperty('content')) {
            this.logger(methNm + 'typeof this.contObj["content"]: ' + typeof this.contObj['content'] + '; content: ' + JSON.stringify(this.contObj['content']),5);
            if ((typeof this.contObj['content'] == 'object')) {
                objFieldData = this.contObj['content'];
                objKeyList = Object.keys(objFieldData); // NOT SURE THIS IS REALLY A WORTHWHILE WAY TO DO THIS
            }
        }
        objKeyList.sort();
        for (var objKeyIdx in objKeyList) {
            var key = objKeyList[objKeyIdx];
            var value = objFieldData[key];
            retval += '<p>';
            retval += '<span style="background-color:#dddddd;"><b>';
            retval += key;
            retval += ': </b> ';
            retval += objFieldData[key];
            retval += '</span>';
            retval += '</p>\n';
            }
        
        retval += '</div>\n';
        
        //this.logger(methNm + 'RETURNING: ' + retval,2);
        return retval;
    }
}
// Serves as a base class for classes which Return HTML for standard 
// Action Controls
// defObjIn contains KVPs for all the parameters which define the look 
// and behavior of the control.
// contObjIn contains KVPs for the initial content of the control
class RMBaseActionControl extends RMBaseControl {
    constructor (defObjIn,contObjIn) {
        super(defObjIn,contObjIn);
        this.logUtil.setClassNm('RMBaseActionControl');
        this.defObj = defObjIn;
        this.contObj = contObjIn;
    }
}
// Generator and actions relating to Graphical Buttons
class RMGrButtonActionControl extends RMBaseActionControl {
    constructor (defObjIn,contObjIn) {
        super(defObjIn,contObjIn);
        this.logUtil.setClassNm('RMGrButtonActionControl');
        this.defObj = defObjIn;
        this.contObj = contObjIn;
        
        //Added defObj keys:
        //- imgsrc: URI path to the button img
        //- imgw: Image width in pixels
        //- imgh: Image height in pixels
        //- imgatxt: "alt" text attribute for the image
        //- imgcssclass: CSS Class for the image
        //- divcssclass: CSS Class for the outer div
        
        // Event Listeners are applied to the image
        
    }
    render () {
        var elStr = this.__buildEventListeners();
        
        var retHtml = '';
        // Time to make the div
        retHtml += '<div ';
        retHtml += 'class="' + this.defObj['divcssclass'] + '" ';
        retHtml += '>\n';
        // It's the picture of a healthy button
        retHtml += '<img ';
        retHtml += 'class="' + this.defObj['imgcssclass'] + '" ';
        retHtml += 'src="' + this.defObj['imgsrc'] + '" ';
        retHtml += 'height="' + this.defObj['imgh'] + '" ';
        retHtml += 'width="' + this.defObj['imgw'] + '" ';
        retHtml += 'alt="' + this.defObj['imgatxt'] + '" ';
        retHtml += elStr;
        retHtml += '>\n';
        retHtml += '</div>\n';
        retHtml += '';
        return retHtml;
    }
}
// Serves as a base class for classes which Return HTML for standard 
// Edit Controls
// defObjIn contains KVPs for all the parameters which define the look 
// and behavior of the control.
// contObjIn contains KVPs for the initial content of the control
class RMBaseEditControl  extends RMBaseControl {
    constructor (defObjIn,contObjIn) {
        super(defObjIn,contObjIn);
    }
}
// Returns HTML for a standard Associative Array Edit Control
// defObjIn contains KVPs for all the parameters which define the look 
// and behavior of the control.
// contObjIn contains KVPs for the initial content of the control
class RMDictEditControl extends RMBaseEditControl{
    constructor (defObjIn,contObjIn) {
        super(defObjIn,contObjIn);
        var methNm = 'RMDictEditControl.constructor - ';
        this.logUtil.setClassNm('RMDictEditControl');
        // Starting by copying the  constructor in from the List Editor.
        this.classNm = 'RMDictEditControl';
        var defObjDefaults = {};
        defObjDefaults['taheight'] = 4;
        defObjDefaults['tawidth'] = 60;
        defObjDefaults['objid'] = 'FAKEObjectId';
        defObjDefaults['fieldname'] = 'FAKEfieldNmIn';
        
        var defObjKeysList = Object.keys(defObjDefaults);
        
        var doklLen = defObjKeysList.length;
        for (var kIdx=0; kIdx<doklLen; kIdx++) {
            var tmpKey = defObjKeysList[kIdx];
            if (this.defObj.hasOwnProperty(tmpKey)) {
                if (this.defObj[tmpKey] == undefined) {
                    this.logger(methNm + 'Key ' + tmpKey + ' exists in this.defObj but has no value.  Using default value: ' + defObjDefaults[tmpKey],2);
                    this.defObj[tmpKey] = defObjDefaults[tmpKey];
                } else {
                    // Probably don't need to do anything here
                }
            } else {
                this.logger(methNm + 'Key ' + tmpKey + ' does not exist in this.defObj.  Using default value: ' + defObjDefaults[tmpKey],2);
                this.defObj[tmpKey] = defObjDefaults[tmpKey];
            }
        }
        
    }
    render() {
        return this.render_derived();
    }
    render_derived() {
        var methNm = 'render_derived - ';
        this.loggerEnh(methNm,"BEGIN!",6);
        var retval = '';
        retval += '<div  style="width:100%;display:block;">\n';
        
        // FIELD IDs NEED TO FOLLOW THE REGULAR CONVENTION!

                    
        //// EXPECTED ID FORMAT FOR FORM FIELDS:  ff-longidhash-objkey-@
        //// dash ('-') is the delimiter, and therefore cannot exist in 
        //// componets of the ID.
        //// * 'ff' in this instance = form field - this is a document element 
        ////   which has a "value" attribute, and that is what will be 
        ////   read/updated.  Other indicators may also end up being used for 
        ////   other methods of acquiring the intended value to retrieve.
        //// * 'longidhash' is standing in for the actual ObjectID hash
        //// * 'objkey' is standing in for the key for the attribute of the 
        ////   Object that the form field represents.  For instances where the 
        ////   form field does not represent an attribute on an object, this 
        ////   will be set to '@'.
        //// * '@' is the "null" placeholder, but this position would hold the 
        ////   "subkey', for those instances when a second-tier of indexing 
        ////   exists, such as in the characterdict attribute of a RMShow 
        ////   object
        
        var fTypeId = 'ff';
        
        var objIdIn = this.defObj['objid'];
        var fieldNmIn = this.defObj['fieldname'];
        var fieldId = objIdIn + fieldNmIn;
        var fieldId = objIdIn + '-' + fieldNmIn;
        var edContainer = fieldId + '-dicteditor';
        var edAddForm = fieldId + '-addform';
        var objFieldData = {};
        var objKeyList = [];
        if (this.contObj.hasOwnProperty('content')) {
            this.loggerEnh(methNm,'typeof this.contObj["content"]: ' + typeof this.contObj['content'] + '; content: ' + JSON.stringify(this.contObj['content']),6);
            if ((typeof this.contObj['content'] == 'object')) {
                objFieldData = this.contObj['content'];
                objKeyList = Object.keys(objFieldData); // NOT SURE THIS IS REALLY A WORTHWHILE WAY TO DO THIS
            }
        }
        
        this.loggerEnh(methNm,'objFieldData: ' + JSON.stringify(objFieldData) + '; objKeyList: ' + JSON.stringify(objKeyList) ,6);
        
        var appendValueElementId = 'ff-' + fieldId + '-addform-newval'
        var submitCmdStr = this.__buildEventListeners({'onclick':"switchboard('dictappend','" + appendValueElementId + "',{})"});
        var fieldBaseId = fTypeId + '-' + this.defObj['objid'] + '-' + this.defObj['fieldname'];
        
        for (var objKeyIdx in objKeyList) {
            var key = objKeyList[objKeyIdx];
            var taId = edContainer + key;
            var liElId = fieldBaseId + '-' + key; 
            
            var onBlurCmdStr = this.__buildEventListeners({'onblur':'switchboard(\'dictupdate\',this.id,{})'});
            this.loggerEnh(methNm,'onBlurCmdStr: ' + onBlurCmdStr,6);

            var deleteCmdStr = this.__buildEventListeners({'onclick':"switchboard('dictdelete','" + liElId + "'),{}"});
            this.loggerEnh(methNm,'deleteCmdStr: ' + deleteCmdStr,6);
            
            retval += '<div style="width:100%;display:inline-flex;margin:2;"><!-- begin ROW DIV -->\n';
            retval += '<div style="width:20%;display:inline-flex;text-align:right;"><b>' + key + ': </b></div> \n';
            retval += '<div style="width:70%;display:inline-flex;">';
            retval += '<textarea style="background-color:white;" rows="' +  this.defObj['taheight'] + '" cols="' +  this.defObj['tawidth'] + '" id="' + liElId + '" ' + onBlurCmdStr + '>';
            retval += objFieldData[key];
            retval += '</textarea>' + '</div>\n';
            retval += '<div style="width:10%;display:inline-flex;text-align:right;">';
            retval += '<button ' + deleteCmdStr + '>Del</button>';
            retval += '</div>\n';
            retval += '</div>\n';
        }
        
        retval += '</div>\n';
        // The "Add" button
        var nmfId = edContainer + 'newmemberform';
        var nmvId = edContainer + 'newval';
        var addOnClickJS = this.__buildEventListeners({'onclick':"switchboard('dictadd','" + fieldBaseId + "',{})"});  // localExposeAddFormListItem
        
        retval += '<div  style="width:100%;display:block;text-align:right">\n';
        retval += '<span style="text-align:right;">';
        retval += '<button ' + addOnClickJS + '>Add</button>';
        retval += '</span>\n';
        retval += '</div>\n';
        
        // The "Add Form" div
        retval += '<div style="display:none; width: 100%" id="' + edAddForm + '">\n';
        // THIS IS THE TEXT BOX THAT'S FORCING THE THING TO BE TOO WIDE.  
        // NEED TO FIGURE OUT A WAY TO MAKE THIS FIT BETTER IN THE 
        // NARROW MIDDLE BOX BUT STILL TAKE ADVANTAGE OF THE WIDER COL BOX
        
        retval += '<div><b>Label: </b> <textarea id="ff-' + edAddForm + '-newkey' + '" rows="' +  this.defObj['taheight'] + '" cols="' +  this.defObj['tawidth'] + '"></textarea></div>\n';
        retval += '<div><b>Content: </b> <textarea id="ff-' + edAddForm + '-newval' + '" rows="' +  this.defObj['taheight'] + '" cols="' +  this.defObj['tawidth'] + '"></textarea></div>\n';
        retval += '<div><button ' + submitCmdStr + '>Submit</button></div>\n';
        retval += '</div>\n';
        
        //this.logger(methNm + 'RETURNING: ' + retval,2);
        return retval;
    }
    modifyOmni(actionIn,argObjIn) {
        var methNm = 'modifyOmni';
        
        var objIdIn = argObjIn['objid'];
        var elIdPartList = objIdIn.split('-');
        if (elIdPartList[0] != 'ff') {
            var errMsg = 'WHOA! ' + objIdIn + 'is not an "ff"!!';
            this.loggerEnh(methNm,'WHOA!  not an "ff"',2);
            throw errMsg;
            return false;
        }
        var objId = elIdPartList[1];
        var fieldNm = elIdPartList[2];

        try {
            switch (actionIn) {
                case 'add':
                    var newValue = document.getElementById(objIdIn).value;
                    var keyElId = 'ff-' + objId + '-' + fieldNm + '-addform-newkey';
                    var newKey = document.getElementById(keyElId).value
                    var fieldObj = this.sse.rmSSEOSRead(objId);
                    if ((fieldObj[fieldNm] == undefined) || (typeof fieldObj[fieldNm] != typeof {})) {
                        fieldObj[fieldNm] = {};
                    } 
                    fieldObj[fieldNm][newKey] = newValue;
                    this.logger(methNm + 'fieldNm: ' + fieldNm + '; content: ' + JSON.stringify(fieldObj),6);
                    this.sse.rmSSEOSLocalWrite(fieldObj);
                    break;
                case 'update':
                    var listIdx = elIdPartList[3];
                    var newValue = document.getElementById(objIdIn).value;
                    var fieldObj = this.sse.rmSSEOSRead(objId);
                    fieldObj[fieldNm][listIdx] = newValue;
                    this.sse.rmSSEOSLocalWrite(fieldObj);
                    break;
                case 'delete':
                    var listIdx = elIdPartList[3];
                    var fieldObj = this.sse.rmSSEOSRead(objId);
                    var objOld = fieldObj[fieldNm];
                    this.logger(methNm + 'Planning to delete key ' + listIdx + ' from field ' + fieldNm + ' in this Object: ' + JSON.stringify(objOld),6);
                    delete objOld[listIdx];
                    fieldObj[fieldNm] = objOld;
                    this.sse.rmSSEOSLocalWrite(fieldObj);
                    break;
                default:
                    this.loggerEnh(methNm,'actionIn value ' + actionIn + ' is not valid.',2);
                    break;
            }
        } catch (e) {
            var logStr = 'Something went horribly wrong trying to do the thing based on these values: ';
            logStr += 'actionIn: ' + actionIn + '; argObjIn: ' + JSON.stringify(argObjIn) + ';  EXCEPTION: ';
            logStr += JSON.stringify(e);
            this.loggerEnh(methNm,logStr,2);
            
        }
    }
}
// Returns HTML for a standard Ordered Array Edit Control
// defObjIn contains KVPs for all the parameters which define the look 
// and behavior of the control.
// contObjIn contains KVPs for the initial content of the control
//RMListEditControl.modifyOmni(actionIn,argObjIn)
class RMListEditControl  extends RMBaseEditControl{
    constructor (defObjIn,contObjIn) {  //  SO, THIS NEEDS TO COPE WITH ACCESSING AN EXTANT OBJECT.
        var methNm = 'RMListEditControl.constructor - ';
        super(defObjIn,contObjIn);
        this.logUtil.setClassNm('RMListEditControl');

        var defObjDefaults = {};
        defObjDefaults['taheight'] = 4;
        defObjDefaults['tawidth'] = 60;
        defObjDefaults['objid'] = 'FAKEObjectId';
        defObjDefaults['fieldname'] = 'FAKEfieldNmIn';
        
        
        var defObjKeysList = Object.keys(defObjDefaults);
        
        var doklLen = defObjKeysList.length;
        for (var kIdx=0; kIdx<doklLen; kIdx++) {
            var tmpKey = defObjKeysList[kIdx];
            if (this.defObj.hasOwnProperty(tmpKey)) {
                if (this.defObj[tmpKey] == undefined) {
                    this.logger(methNm + 'Key ' + tmpKey + ' exists in this.defObj but has no value.  Using default value: ' + defObjDefaults[tmpKey],2);
                    this.defObj[tmpKey] = defObjDefaults[tmpKey];
                } else {
                    // Probably don't need to do anything here
                }
            } else {
                this.logger(methNm + 'Key ' + tmpKey + ' does not exist in this.defObj.  Using default value: ' + defObjDefaults[tmpKey],2);
                this.defObj[tmpKey] = defObjDefaults[tmpKey];
            }
        }
    }
    render() {
        return this.render_derived();
    }
    render_derived() {
        var methNm = 'render_derived - ';
        this.logger(methNm + "BEGIN!",5);
        var retval = '';
        retval += '<div  style="width:100%;display:block;">\n';
        
        // THIS NEEDS TO WORK HERE
        //var elfObj = {'onblur':'localUpdateFormField(this.id)'};
        //var elFuncStr = this.__buildEventListeners(elfObj);
        
        // FIELD IDs NEED TO FOLLOW THE REGULAR CONVENTION!
                    
        //// EXPECTED ID FORMAT FOR FORM FIELDS:  ff-longidhash-objkey-@
        //// dash ('-') is the delimiter, and therefore cannot exist in 
        //// componets of the ID.
        //// * 'ff' in this instance = form field - this is a document element 
        ////   which has a "value" attribute, and that is what will be 
        ////   read/updated.  Other indicators may also end up being used for 
        ////   other methods of acquiring the intended value to retrieve.
        //// * 'longidhash' is standing in for the actual ObjectID hash
        //// * 'objkey' is standing in for the key for the attribute of the 
        ////   Object that the form field represents.  For instances where the 
        ////   form field does not represent an attribute on an object, this 
        ////   will be set to '@'.
        //// * '@' is the "null" placeholder, but this position would hold the 
        ////   "subkey', for those instances when a second-tier of indexing 
        ////   exists, such as in the characterdict attribute of a RMShow 
        ////   object
        
        var fTypeId = 'ff';
        var objIdIn = this.defObj['objid'];
        var fieldNmIn = this.defObj['fieldname'];
        var fieldId = objIdIn + fieldNmIn;
        var fieldId = objIdIn + '-' + fieldNmIn;
        var edContainer = fieldId + '-arrayeditor';
        var edAddForm = fieldId + '-addform';
        var objFieldData = this.contObj['content'];
        var objKeyList = Object.keys(objFieldData); // NOT SURE THIS IS REALLY A WORTHWHILE WAY TO DO THIS
        
        var addCmdStr = "console.log('CALLED addCmdStr')";  // <<== PUT AN ACTUAL USEFUL JAVASCRIPT THINGY HERE!!!
        var appendValueElementId = 'ff-' + fieldId + '-addform-newval'
        var submitCmdStr = this.__buildEventListeners({'onclick':"switchboard('listappend','" + appendValueElementId + "',{})"});
        var fieldBaseId = fTypeId + '-' + this.defObj['objid'] + '-' + this.defObj['fieldname'];
        
        for (var objKeyIdx in objKeyList) {
            var key = parseInt(objKeyList[objKeyIdx]);
            var taId = edContainer + key;
            var liElId = fieldBaseId + '-' + key; 
            
            var onBlurCmdStr = this.__buildEventListeners({'onblur':'switchboard(\'listupdate\',this.id,{})'});

            var deleteCmdStr = this.__buildEventListeners({'onclick':"switchboard('listdelete','" + liElId + "',{})"});
            
            retval += '<div style="width:100%;display:inline-flex;margin:2;"><!-- begin ROW DIV -->\n';
            retval += '<div style="width:20%;display:inline-flex;text-align:right;"><b>' + key + ': </b></div> \n';
            retval += '<div style="width:70%;display:inline-flex;">';
            retval += '<textarea style="background-color:white;" rows="' +  this.defObj['taheight'] + '" cols="' +  this.defObj['tawidth'] + '" id="' + liElId + '" ' + onBlurCmdStr + '>';
            retval += objFieldData[key];
            retval += '</textarea>' + '</div>\n';
            retval += '<div style="width:10%;display:inline-flex;text-align:right;">';
            retval += '<button ' + deleteCmdStr + '>Del</button>';
            retval += '</div>\n';
            retval += '</div>\n';
        }
        
        retval += '</div>\n';
        // The "Add" button
        var nmfId = edContainer + 'newmemberform';
        var nmvId = edContainer + 'newval';
        var addOnClickJS = this.__buildEventListeners({'onclick':"switchboard('listadd','" + fieldBaseId + "',{})"});  // localExposeAddFormListItem
        
        retval += '<div  style="width:100%;display:block;text-align:right">\n';
        retval += '<span style="text-align:right;">';
        retval += '<button ' + addOnClickJS + '>Add</button>';
        retval += '</span>\n';
        retval += '</div>\n';
        
        // The "Add Form" div
        retval += '<div style="display:none; width: 100%" id="' + edAddForm + '">\n';
        // THIS IS THE TEXT BOX THAT'S FORCING THE THING TO BE TOO WIDE.  
        // NEED TO FIGURE OUT A WAY TO MAKE THIS FIT BETTER IN THE 
        // NARROW MIDDLE BOX BUT STILL TAKE ADVANTAGE OF THE WIDER COL BOX
        
        
        retval += '<div><b>Content: </b> <textarea id="ff-' + edAddForm + '-newval' + '" rows="' +  this.defObj['taheight'] + '" cols="' +  this.defObj['tawidth'] + '"></textarea></div>\n';
        retval += '<div><button ' + submitCmdStr + '>Submit</button></div>\n';
        retval += '</div>\n';
        
        return retval;
    }
    modifyOmni(actionIn,argObjIn) {
        var methNm = 'modifyOmni';
        
        var objIdIn = argObjIn['objid'];
        var elIdPartList = objIdIn.split('-');
        if (elIdPartList[0] != 'ff') {
            var errMsg = 'WHOA! ' + objIdIn + 'is not an "ff"!!';
            this.loggerEnh(methNm,'WHOA!  not an "ff"',2);
            throw errMsg;
            return false;
        }
        var objId = elIdPartList[1];
        var fieldNm = elIdPartList[2];
        
        try {
            switch (actionIn) {
                case 'add':
                    var newValue = document.getElementById(objIdIn).value;
                    var fieldObj = this.sse.rmSSEOSRead(objId);
                    fieldObj[fieldNm].push(newValue);
                    this.sse.rmSSEOSLocalWrite(fieldObj);
                    break;
                case 'update':
                    var listIdx = elIdPartList[3];
                    var newValue = document.getElementById(objIdIn).value;
                    var fieldObj = this.sse.rmSSEOSRead(objId);
                    fieldObj[fieldNm][listIdx] = newValue;
                    this.sse.rmSSEOSLocalWrite(fieldObj);
                    break;
                case 'delete':
                    var listIdx = elIdPartList[3];
                    var fieldObj = this.sse.rmSSEOSRead(objId);
                    var aryOld = fieldObj[fieldNm];
                    var aryNew = [];
                    for (var idx=0;idx<aryOld.length;idx++) {
                        if (idx != listIdx) {
                            aryNew.push(aryOld[idx]);
                        }
                    }
                    fieldObj[fieldNm] = aryNew;
                    this.sse.rmSSEOSLocalWrite(fieldObj);
                    break;
                default:
                    this.loggerEnh(methNm,'actionIn value ' + actionIn + ' is not valid.',2);
                    break;
            }
        } catch (e) {
            var logStr = 'Something went horribly wrong trying to do the thing based on these values: ';
            logStr += 'actionIn: ' + actionIn + '; argObjIn: ' + JSON.stringify(argObjIn) + ';  EXCEPTION: ';
            logStr += JSON.stringify(e);
            this.loggerEnh(methNm,logStr,2);
            
        }
    }
}
// Returns HTML for a standard Text Edit Control, which can be either a
// Single-Line Text Box or a Text Area
// defObjIn contains KVPs for all the parameters which define the look 
// and behavior of the control.
// contObjIn contains KVPs for the initial content of the control
class RMTextEditControl  extends RMBaseEditControl{
    constructor (defObjIn,contObjIn) {
        super(defObjIn,contObjIn);
        //this.logUtil = new RMLogUtil('RMPCObjectContentView',3);
        this.logUtil.setClassNm('RMTextEditControl');
        this.ctlKeyList = ['type','ah','aw','bs','maxlen'];
        // defObjIn should include:
        // type: one of ['box','area']
        // ah: integer area height (only if type == 'area')
        // aw: integer area width (only if type == 'area')
        // bs: integer box size (only if type == 'box')
        // maxlen: integer maximum allowable length of content
        this.ctlKeyList.push('type');
        this.ctlKeyList.push('ah');
        this.ctlKeyList.push('aw');
        this.ctlKeyList.push('bs');
        this.ctlKeyList.push('maxlen');
    }
    render() {
        var methNm = 'render - ';
        this.logger(methNm + 'START!',5);

        var tabOrderStr = ''; // THIS NEEDS TO BE FIGURED OUT
        if (this.defObj.hasOwnProperty('tabindex')) {
            tabOrderStr = ' taborder="' + this.defObj['tabindex'] + '" ';
        }

        var retval = false;
        var elfObj = {'onblur':'switchboard(\'ffupdate\',this.id,{})'}; //switchboard

        if (this.defObj.hasOwnProperty('elfuncs')) {
            elfObj = this.defObj['elfuncs'];
        } 
        
        var retStr = '';
        
        var elFuncStr = this.__buildEventListeners(elfObj);

        var tecType = 'box';
        if (this.defObj.hasOwnProperty('type')) {
            tecType = this.defObj['type'];
        } else {
        }
        switch (tecType) {
            case 'box' :
                // THIS IS MAXIMALLY BASIC.  NEEDS TO RESPECT type, ah, aw, bs, maxlen
                retStr = '<input type="text" ';
                retStr += tabOrderStr;
                retStr += 'id="' + this.defObj['docelid'].toString() + '" ';
                retStr += elFuncStr + ' ';
                retStr += ' value="';
                retStr += this.contObj['content'];
                retStr += '" ';
                retStr += '>';
                //retStr += this.contObj['content'];
                retStr += '</input>\n';
                break;
            case 'area' :
                this.logger(methNm + 'In AREA tecType: ' + tecType,5);
                
                var boxHeight = this.defObj['ah'];
                if (this.defObj.hasOwnProperty('maxlen')) {
                    if (parseInt(this.defObj['maxlen']) > 0) {
                        var contLen = this.contObj['content'].length;
                        var contRows = parseInt(contLen / this.defObj['aw']);
                        if (parseInt(contRows) >= (parseInt(this.defObj['maxlen']) - 1)) {
                            boxHeight = parseInt(this.defObj['maxlen']);
                        } else if (parseInt(contRows) > parseInt(this.defObj['ah'])) {
                            boxHeight = parseInt(contRows) + 1;
                        }
                    }
                }
                
                this.logger(methNm + 'boxHeight: ' + boxHeight,5);
                retStr = '<textarea style="background-color:white;" ';
                retStr += ' rows="' +  boxHeight + '" cols="' +  this.defObj['aw'] + '" ';
                retStr += ' id="' + this.defObj['docelid'].toString() + '" ';
                retStr += elFuncStr + ' ';
                retStr += '>'; 
                retStr += this.contObj['content'];
                retStr += '</textarea>';
                break;
            //case '' :
                
                //break;
            default:
                tecType = 'box';
                // do not change anything
        }
            
        retval = this.__disposeResult(retStr);
        return retval;
    }
}
// Returns HTML for a standard Select List Edit Control
// defObjIn contains KVPs for all the parameters which define the look 
// and behavior of the control.
// contObjIn contains KVPs for the initial content of the control
class RMSelectEditControl  extends RMBaseEditControl{
    constructor (defObjIn,contObjIn) {
        super(defObjIn,contObjIn);
        this.logUtil.setClassNm('RMSelectEditControl');
        // So far, I don't think there's much of anything unusual that has to go here
        this.ctlKeyList = [];
        this.ctlKeyList.push('optlist');
    }
    optionListExpand(oListIn) {
        var methNm = 'optionListExpand - ';
        var logDebug = 6
        this.loggerEnh(methNm,'BEGIN - oListIn: ' + JSON.stringify(oListIn),logDebug);
        var retval = false;
        var retList = [];
        try {
            for (var oIdx=0;oIdx<oListIn.length;oIdx++) {
                var tmpStr = oListIn[oIdx];
                var tmpObj = {'label':tmpStr,'value':tmpStr};
                retList.push(tmpObj);
            }
        } catch (e) {
            this.loggerEnh(methNm,'GAH!  EXCEPTION!',2);
        }
        
        if (retList.length > 0) {
            retval = retList;
        }
        this.loggerEnh(methNm,'retList: ' + JSON.stringify(retList),logDebug);
        this.contObj['optlist'] = retList;
        return retval;
    }
    render () {
        var methNm = 'render - ';
        var logDebug = 6
        this.loggerEnh(methNm,'BEGIN!',logDebug);
        this.loggerEnh(methNm,'this.contObj: ' + JSON.stringify(this.contObj),logDebug);

        var retval = false;
        var elFuncStr = this.__buildEventListeners(this.defObj['elfuncs']); //this.defObj.elfuncs
        var tabOrderStr = ''; // THIS NEEDS TO BE FIGURED OUT
        if (this.defObj.hasOwnProperty('tabindex')) {
            tabOrderStr = ' taborder="' + this.defObj['tabindex'] + '" ';
        }
        // Needs a list of objects as options:
        // [{'label':'This is the label 1','value':'this_is_the_value_1'},{'label':'This is the label_2','value':'this_is_the_value_2'}]

        var htmlSelHead = '<select id="' + this.defObj['docelid'].toString() + '" ' + elFuncStr + ' ' + tabOrderStr + ' ';
        htmlSelHead += 'style="background-color: #ffffff;" >\n';


        var htmlOptList = '';
        var oList = this.contObj['optlist'];
        var olLen = oList.length;
        this.loggerEnh(methNm,'Option List passed in: ' + JSON.stringify(oList),logDebug);
        for (var oIdx=0; oIdx<olLen; oIdx++) {
            var optObj = oList[oIdx];
            var optLabel = optObj.label;
            var optValue = optObj.value;
            htmlOptList += '<option value="' + optValue + '">' + optLabel + '</option>\n';
        }
        
        var htmlSelFoot = "</select>\n";
        
        var retStr = htmlSelHead + htmlOptList + htmlSelFoot;
        
        retval = this.__disposeResult(retStr);
        return retval;
    }
}
// SOME DAY this will be a generic, flexible-but-standard way to create a 
// now widely-used control model, wherein a block containing 3 divs is 
// returned, with one being a summary, one being a resd-only detail list
// and one being an "edit" box, the normal operaztion of which would be 
// that on initial display, the "summary" div would be exposed, and the 
// other 2 would not.  A "detail" button would expose the RO div (hiding 
// the summary), and an "edit" button would expose the RW div, and hide 
// the other two.  Proper handling of forms (dictionaries, lsits, select 
// lists, et cetera) is a MUST HAVE.
class RMSummaryDetailEditControl extends RMBaseControl {
    constructor (defObjIn,contObjIn) {
        super(defObjIn,contObjIn);
        this.logUtil.setClassNm('RMSummaryDetailEditControl');
    }
    
    
}

//
//  NEW TAB CONTAINER CLASS
//

/*
 *  should probably figure out how to store the tab container (and its 
 *  tabs') state and metadata in SessionStorage so the selected tab and 
 *  whatnot can be persisted from load to load.
 * 
 * */
class RMTabContainer {
    constructor(cfgObjIn) {
        /* Setup Object:
         * 
         * uidbase: str - value used to identify the the container and all its parts
         * 
         * 
         * 
         * */
         
         // css class names for selected and unselected labels and bodies (?)
         
         this.logUtil = new RMLogUtil('RMTabContainer',3);
         
         this.cfg = {};
         this.cfg['uidbase'] = cfgObjIn['uidbase'];
         this.cfg['tabcontainerdivid'] = this.cfg.uidbase + '-tabcontainerouter';
         this.cfg['labelrowdivid'] = this.cfg.uidbase + '-labelrowouter';
         this.cfg['bodyrowdivid'] = this.cfg.uidbase + '-bodyrowouter';
         this.cfg['footrowdivid'] = this.cfg.uidbase + '-footrowouter';
         this.cfg['bodyactiveclass'] = 'tabcontent-selected';
         this.cfg['bodyinactiveclass'] = 'tabcontent-unselected';
         this.cfg['labelactiveclass'] = 'tabheader-selected';
         this.cfg['labelinactiveclass'] = 'tabheader-unselected';
         this.cfg.targetcontainer = cfgObjIn['target'];
         this.tabMetaList = [];
         this.tabMetaModel = {};
         this.tabMetaModel['label'] = 'Default Label';
         this.tabMetaModel['sortidx'] = 0;
         this.tabMetaModel['bodypopscr'] = 'return "<div><b>hello " + parmObjIn["name"] +</b></div>";'; //assumes 'parmObjIn' will be passed
         this.tabMetaModel['bodypopparmobj'] = {'name':'Noodles'};
         this.tabMetaModel['bodydivid'] = '';
         this.tabMetaModel['labeldivid'] = '';
         this.tabMetaModel['idbase'] = 'defaultidbase';
         this.tabMetaModel['labeleventlisteners'] = [{'event':'onclick','script':'document.getElementById(this.id).style.backgroundColor = \'#88ff88\''}];
    }
    logger (methNmIn,msgIn,lvlIn) {
        this.logUtil.log(methNmIn,msgIn,lvlIn);
    }
    __buildEventListeners (elObjIn) {
        var methNm = '__buildEventListeners - ';
        var elKeyList = [];
        var elObj = {};
        //      HEY, STUPID!!!
        //  SO, THIS SHOULD BE ABLE TO TAKE AN ARGUMENT OF AN OBJECT 
        // CONTAINING KVPs OF event:function AND ITERATE OVER THAT.  
        // IF NO ARG PROVIDED, USE this.defObj.elfuncs
        if (elObjIn != undefined) {
            if (typeof elObjIn == 'object') {
                elKeyList  = Object.keys(elObjIn);
                elObj = elObjIn;
            } else {
                this.logger(methNm,"elObjIn is garbage.  Time to die.",2);
                return '';
            }
        } else { 
            this.logger(methNm,"elObjIn is garbage.  Time to die.",2);
            return '';
        }
        
        var permittedEventListeners = ['onclick'];
                
        // Not sure if this should add event listeners to an existing 
        // element (e.g. document.getElementById('foo').addEventListener()) 
        // or just add them as strings in the HTML.
        // Either way, we'll have to iterate over elfuncs key in defObjIn
        // to build them.
        
        //string-based route:
        var retStr = '';
        var pelIdx = parseInt(0);
        var maxIdx = parseInt(permittedEventListeners.length);
        if (pelIdx < maxIdx) {
        }
        
        for (pelIdx=0;pelIdx<maxIdx;pelIdx++) {
            var tmpKey = permittedEventListeners[pelIdx];
            if (elObj.hasOwnProperty(tmpKey)) {
                if (elObj[tmpKey] != undefined) {
                    var tmpel = ' ' + tmpKey.toString() + '="' + elObj[tmpKey].toString() + '" '; 
                    retStr += tmpel;
                } else {
                }
            } else {
            }
        }
        return retStr;
    }
    __initWidgetContainer() {
        var cntDiv = document.createElement('div');
        cntDiv.class = 'tabcontainer';
        cntDiv.id = this.cfg['tabcontainerdivid'];
        var hdrDiv = document.createElement('div');
        hdrDiv.id = this.cfg['labelrowdivid'];
        var bdyDiv = document.createElement('div');
        bdyDiv.id = this.cfg['bodyrowdivid'];
        var footDiv = document.createElement('div');
        footDiv.id = this.cfg['footrowdivid'];
        
        cntDiv.appendChild(hdrDiv);
        cntDiv.appendChild(bdyDiv);
        cntDiv.appendChild(footDiv);
        
        return cntDiv;
    }
    __deselectTab(labelDivIdIn) {
        var idElList = labelDivIdIn.split('-');
        var bodyDivId = idElList[0] + '-' + idElList[1] + '-body';
        document.getElementById(labelDivIdIn).className = this.cfg['labelinactiveclass'];
        document.getElementById(bodyDivId).className = this.cfg['bodyinactiveclass'];
    }
    __selectTab(labelDivIdIn) {
        var idElList = labelDivIdIn.split('-');
        var bodyDivId = idElList[0] + '-' + idElList[1] + '-body';
        document.getElementById(labelDivIdIn).className = this.cfg['labelactiveclass'];
        document.getElementById(bodyDivId).className = this.cfg['bodyactiveclass'];
    }
    __createTab(tabDefObj) {
        var methNm = '__createTab';
        this.logger(methNm,'BEGIN',6);
        // This is the object we'll actually use here for our metadata
        // It provides an airgap between the parameter object passed in 
        // and the parameters used in execution to reduce the risk of
        // working on unexpected code or values
        var myMeta = {};
        // We'll return the label and body in one object.
        var retObj = {'label':undefined,'body':undefined};
        
        // Let's make sure tabDefObj has the data we need
        // This is the list of keys we're expecting
        var tmlKeysList = Object.keys(this.tabMetaModel);
        // This is what we'll use as our working key.  Defining out here
        // so we can use it if an exception is thrown
        var wKey = undefined;
        // Cycle through the list of expected keys and make sure the parameter object has all of them
        try {
            for (var aIdx=0;aIdx<tmlKeysList.length;aIdx++) {
                wKey = tmlKeysList[aIdx];
                myMeta[wKey] = this.tabMetaModel[wKey];
                if (typeof tabDefObj[wKey] == typeof this.tabMetaModel[wKey]) {
                    myMeta[wKey] = tabDefObj[wKey];
                }
            }
        } catch (e) {
            var errStr = methNm + "bad key " + wKey + ' (' + JSON.stringify(e) + ')'; 
            this.logger(errStr,2);
            throw(errStr);
        }
        this.logger(methNm,'myMeta: ' + JSON.stringify(myMeta),6);
        retObj['label'] = this.__renderLabelDiv(myMeta);
        retObj['body'] = this.__renderBodyDiv(myMeta);
        myMeta['labeldivid'] = retObj['label'].id;
        myMeta['bodydivid'] = retObj['body'].id;
        this.tabMetaList.push(myMeta);
        return retObj;
    }
    __destroyTab(labelDivIdIn) {
        var idElList = labelDivIdIn.split('-');
        var bodyDivId = idElList[0] + '-' + idElList[1] + '-body';
        var labelEl = document.getElementById(labelDivIdIn);
        var labelParentEl = labelEl.parentNode;
        labelParentEl.removeChild(labelEl);
        
        var bodyEl = document.getElementById(bodyDivId);
        bodyEl.parentNode.removeChild(bodyEl);
        var labelElList = labelParentEl.children;
        if (labelElList.length < 1) {
            var uniqId = 'epochtimestamp';  //  <<=== MAKE THIS ACTUALLY MAKE A TIMESTAMP
            var tabDefObj = {};
            tabDefObj['label'] = 'New Tab';
            tabDefObj['sortidx'] = 0;
            //  START THESE TWO SHOULD PROBABLY DO SOMETHING MORE REASONABLE
            tabDefObj['bodypopscr'] = 'return "<div><b>hello " + parmObjIn["name"] + "</b></div>";'; //assumes 'parmObjIn' will be passed
            tabDefObj['bodypopparmobj'] = {'name':'Noodles'};
            //  END THESE TWO SHOULD PROBABLY DO SOMETHING MORE REASONABLE
            tabDefObj['bodydivid'] = '';
            tabDefObj['labeldivid'] = '';
            tabDefObj['idbase'] = uniqId;
            tabDefObj['labeleventlisteners'] = [{'event':'onclick','script':'switchboard(\'tabselect\',this.id,{})'}];
            this.addTab(tabDefObj);
            
        }
        this.setFirstTabActive();
    }
    __alterTabList () {
        // Add/remove/reorder tabs
    }
    __renderLabelDiv (tabDefObjIn) {
        var methNm = '__renderLabelDiv';
        this.logger(methNm,'BEGIN',6);
        var elIdBase = '' + this.cfg['uidbase'] + '-' + tabDefObjIn['idbase'];
        var elId = elIdBase + '-label';
        var labelContent = '<div style="display:block;width:100%;>\n'; 
        labelContent += '<div style="display:inline-flex;">\n';
        labelContent += '<span class="tabheader" style="align:left;">' + tabDefObjIn['label'] + '</span>\n';
        labelContent += '</div>\n';
        labelContent += '<divstyle="display:inline-flex;float:right">\n';
        labelContent += '<span style="align:right"><b>X</b></span>\n';
        labelContent += '</div>\n';
        labelContent += '</div>\n';
        
        // SELECT BUTTON
        var labelButtonDiv = document.createElement('div');
        labelButtonDiv.id = elId + '-selector';
        labelButtonDiv.style.display = "inline-flex";
        labelButtonDiv.innerHTML = '<span class="tabheader" style="align:left;">' + tabDefObjIn['label'] + '</span>\n';
        // labeleventlisteners
        var elList = tabDefObjIn['labeleventlisteners'];
        for (var idx=0; idx<elList.length; idx++) {
            var elValObj = elList[idx];
            labelButtonDiv.setAttribute(elValObj['event'],elValObj['script']);
        }
        
        // KILL BUTTON
        var tabKillButtonDiv = document.createElement('div');
        tabKillButtonDiv.id = elId + '-kill';
        tabKillButtonDiv.style.display = "inline-flex";
        tabKillButtonDiv.style.float = "right";
        tabKillButtonDiv.innerHTML = '<span style="align:right"><b>X</b></span>\n';
        tabKillButtonDiv.setAttribute('onclick','switchboard(\'tabkill\',this.id,{})');
        
        // BUTTON WRAPPER
        var tabLabelWrapperDiv = document.createElement('div');
        tabLabelWrapperDiv.style.display = 'block';
        tabLabelWrapperDiv.style.width = '100%';
        tabLabelWrapperDiv.appendChild(labelButtonDiv);
        tabLabelWrapperDiv.appendChild(tabKillButtonDiv);
        
        
        // LABEL TAB DIV
        var tabLabelDiv = document.createElement('div');
        tabLabelDiv.id = elId;
        tabLabelDiv.className = this.cfg['labelinactiveclass'];
        tabLabelDiv.appendChild(tabLabelWrapperDiv);
        
        return tabLabelDiv;
    }
    __renderBodyDiv(tabDefObjIn) {
        var methNm = '__renderBodyDiv';
        this.logger(methNm,'BEGIN',6);
        var elIdBase = '' + this.cfg['uidbase'] + '-' + tabDefObjIn['idbase'];
        var tabBodyDiv = document.createElement('div');
        tabBodyDiv.id = '' + elIdBase + '-body';
        tabBodyDiv.className = this.cfg['bodyinactiveclass'];
        this.logger(methNm, 'tabDefObjIn.bodypopscr: ' + tabDefObjIn['bodypopscr'],6);
        var bodyPopFunc = new Function ('parmObjIn', tabDefObjIn['bodypopscr']);
        var bodyContent = bodyPopFunc(tabDefObjIn['bodypopparmobj']);
        tabBodyDiv.innerHTML = bodyContent;
        return tabBodyDiv;
    }
    render() {
        return this.__initWidgetContainer();
    }
    renderPop() {
        var te = document.getElementById(this.cfg['targetcontainer']);
        te.innerHTML = '';
        te.appendChild(this.render());
    }
    addTab(tabDefObjIn) {
        var tabObj = this.__createTab(tabDefObjIn);
        document.getElementById(this.cfg['labelrowdivid']).appendChild(tabObj['label']);
        document.getElementById(this.cfg['bodyrowdivid']).appendChild(tabObj['body']);
    }
    tabClick(labelDivIdIn) {
        // Set all siblings to de-selected
        var sibElList = document.getElementById(labelDivIdIn).parentElement.children;
        for (var idx=0; idx<sibElList.length; idx++) {
            this.__deselectTab(sibElList[idx].id);
        }
        this.__selectTab(labelDivIdIn);
    }
    tabRemove(labelDivIdIn) {
        this.__deselectTab(labelDivIdIn);
        this.__destroyTab(labelDivIdIn);
    }
    setFirstTabActive() {
        var lre = document.getElementById(this.cfg['labelrowdivid']);
        this.tabClick(lre.children[0].id);
    }
}
// Container and functions for the "tools" portion of the application 
//container
class RMToolsContainer {    ////  CREATE SHOW BUTTON  // DO A PERMISSIONS CHECK    //  <<===== STILL NEED TO DO
    constructor(cfgObjIn) {
        this.logUtil = new RMLogUtil('RMToolsContainer',3);
        this.sse = new RMSSSEnhanced();
        
        // This is a little helper function to simplify setting up this.toolKeyList 
        function mkKeyObj (nmIn,typIn,emptyFlag) {
            return {'name':nmIn,'type':typIn,'permitempty':emptyFlag};
        }
        // This object defines the parameter object (cfgObjIn) expected by this.__renderTool
        this.toolKeyList = [];
        this.toolKeyList.push(mkKeyObj('label','string',false));
        this.toolKeyList.push(mkKeyObj('domidbase','string',false));
        this.toolKeyList.push(mkKeyObj('eventlisteners','dict',false));
        this.toolKeyList.push(mkKeyObj('cssclass','string',false));
        this.toolKeyList.push(mkKeyObj('presentationmode','string',false));
        this.toolKeyList.push(mkKeyObj('deliverymode','string',false));
        this.toolKeyList.push(mkKeyObj('targparentdomid','string',false));
    }
    logger (methNmIn,msgIn,lvlIn) {
        this.logUtil.log(methNmIn,msgIn,lvlIn);
    }
    __validateCustToolsDef(objIn) {
        // Should return false if no pass.  For now, we're just going to 
        // say this is fine.
        return true;
    }
    __buildEventListeners (elObjIn) {
        var su = new RMSuperUtil();
        return su.buildEventListeners(elObjIn);
    }
    __renderTool(cfgObjIn) {
        var methNm = '__renderTool';
        var wkCfgObj = {};
        var permittedPresModes = ['grbut','htmlbut','jslink','httplink']
        // Let's verify the passed in config has all the needed keys and values as valid as we can tell
        for (var aIdx=0;aIdx<this.toolKeyList.length;aIdx++) {
            var wkRefObj = this.toolKeyList[aIdx];
            try {
                if (cfgObjIn.hasOwnProperty(wkRefObj['name'])) {
                    var tmFlag = false;
                    var valFlag = true;
                    switch (wkRefObj['type']) {
                        case 'list' :
                            if (Array.isArray(cfgObjIn[wkRefObj['name']])) {
                                tmFlag = true;
                                if (wkRefObj['permitempty'] == false) {
                                    if (cfgObjIn[wkRefObj['name']] == []){
                                        valFlag = false;
                                    }
                                }
                            }
                            break;
                        case 'dict' :
                            if ((typeof cfgObjIn[wkRefObj['name']] == 'object') && (! (Array.isArray(cfgObjIn[wkRefObj['name']])))) {
                                tmFlag = true;
                                if (wkRefObj['permitempty'] == false) {
                                    if (cfgObjIn[wkRefObj['name']] == {}){
                                        valFlag = false;
                                    }
                                }
                            }
                            break;
                        case 'string':
                            if (typeof cfgObjIn[wkRefObj['name']] == 'string') {
                                tmFlag = true;
                                if (wkRefObj['permitempty'] == false) {
                                    if (cfgObjIn[wkRefObj['name']] == ''){
                                        valFlag = false;
                                    }
                                }
                            }
                            break;
                        case 'int':
                            if (typeof cfgObjIn[wkRefObj['name']] == 'number') {
                                if (parseInt(cfgObjIn[wkRefObj['name']]) == cfgObjIn[wkRefObj['name']]) {
                                    tmFlag = true;
                                }
                            }
                            break;
                        case 'float':
                            if (typeof cfgObjIn[wkRefObj['name']] == 'number') {
                                if (parseFloat(cfgObjIn[wkRefObj['name']]) == cfgObjIn[wkRefObj['name']]) {
                                    tmFlag = true;
                                }
                            }
                            break;
                        case 'boolean':
                            if (typeof cfgObjIn[wkRefObj['name']] == 'boolean') {
                                tmFlag = true;
                            }
                            break;
                        default:
                            break;
                    }
                    if (tmFlag == false) {
                        var xMsg = 'Value of key ' + wkRefObj['name'] + ' is not of type ' + wkRefObj['type'];
                        this.logger(methNm,xMsg,2);
                        throw xMsg;
                    }
                    if (valFlag == false) {
                        var xMsg = 'Value of key ' + wkRefObj['name'] + ' is empty, but not permitted to be';
                        this.logger(methNm,xMsg,2);
                        throw  xMsg;
                    }
                        
                    // OK, we've gotten here, so we know that the key is
                    // present, and its value is of the correct type, 
                    // and has a non-empty value if required to
                    
                    // Setting the key for the working config object to 
                    // the value of the provided parameter object
                    wkCfgObj[wkRefObj['name']] = cfgObjIn[wkRefObj['name']];
                        
                } else {
                    var msg = 'Key ' + wkRefObj['name'] + ' is missing.';
                    this.logger(methNm,xMsg,2);
                    throw msg;
                }
            }catch (e) {
                var msg = JSON.stringify(e);
                this.logger(methNm,xMsg,2);
                throw msg;
            }
        }
        
        // Let's buld the event listeners
        var su = new RMSuperUtil();
        var elStr = su.buildEventListeners(cfgObjIn['eventlisteners']);
        
        // OK, now we've confirmed that the supplied config object is nominally sane.
        //  Let's get to RENDERIN' !!!
        
        // Make sure the presentation mode is valid
        if (permittedPresModes.indexOf(wkCfgObj['presentationmode']) < 0) {
            throw 'Presentation Mode ' + wkCfgObj['presentationmode'] + ' is not valid.';
        }
        
        // Do the needful based on presentation mode
        var retHtml = '';
        switch (wkCfgObj['presentationmode']) {
            case 'grbut':
                // render as a graphical button
                throw methNm + ' grbut is not implemented';
                break;
            case 'htmlbut':
                // render as an HTML button
                var retDiv = document.createElement('div');
                
                var tmpHtml = '<button class="';
                tmpHtml += wkCfgObj['cssclass'];
                tmpHtml += '"';
                tmpHtml += ' ' + elStr;
                tmpHtml += '>';
                tmpHtml += wkCfgObj['label'];
                tmpHtml += '</button>';
                break;
            case 'jslink':
                // render as a javascript link
                throw methNm + ' jslink is not implemented';
                break;
            case 'httplink':
                // render as an HTTP link
                throw methNm + ' httplink is not implemented';
                break;
            default:
                break;
        }
        
        /*
         * Settings:
         * label = ''
         * domidbase = ''
         * eventlisteners = [] // NOPE!  NEEDS TO BE KVPs... {'event1':'script1','event2':'script2',}
         * cssclass = ''
         * presentationmode = 'grbut'|'htmlbut'|'jslink'|'httplink'
         * deliverymode = (same as actionControl classes)
         * targparentdomid = '' (only required if deliverymode warrants)
         *  
         * 
         * 
         * */
         return su.disposeHtmlResult (tmpHtml,'returnhtml','');
    }
    __renderStockTools () {   ////  CREATE SHOW BUTTON  // DO A PERMISSIONS CHECK    //  <<===== STILL NEED TO DO
        var methNm = '__renderStockTools';
        var su = new RMSuperUtil();
        this.logger(methNm,'BEGIN',6);
        var stdToolsDiv = document.createElement('div');
        
        var sessionObj = this.sse.rmSSEFetchSession();
        var sOid = sessionObj['oid'];
        var oidObj = this.sse.rmSSEOSRead(sOid);
        this.logger(methNm,'oidObj: ' + JSON.stringify(oidObj),6);
        
        // Create Tree   // <<=== Maybe not show this at all in the regular interface
        
        // Create Show  // Have to have perms on the tree
        try {
            // DO A PERMISSIONS CHECK    //  <<===== STILL NEED TO DO
            // Make sure we have a tree selected
            if ((sessionObj['tid'] != undefined) && (sessionObj['tid'] != '')) {
                if (true) { // Just leaving this here, in case another condition is required
                    this.logger(methNm,'Making the show create tool...',6);
                    // make the render tool
                    var cfgObj = {};
                    cfgObj.label = 'Create Show';
                    cfgObj.domidbase = 'notarealelementid';
                    cfgObj.eventlisteners = {'onclick':'switchboard(\'buttshowcreate\',\'\',{})'};
                    cfgObj.cssclass = 'notarealclass';
                    cfgObj.presentationmode = 'htmlbut';
                    cfgObj.deliverymode = 'returnhtml';   // <<==== figure this out
                    cfgObj.targparentdomid = 'notatallrelevant';  // <<==== figure this out
                    
                    var pubToolDiv = this.__renderTool(cfgObj);
                    stdToolsDiv.innerHTML += pubToolDiv;
                    
                    /*
                     * Settings:
                     * label = ''
                     * domidbase = ''
                     * eventlisteners = {}
                     * cssclass = ''
                     * presentationmode = 'grbut'|'htmlbut'|'jslink'|'httplink'
                     * deliverymode = (same as actionControl classes)
                     * targparentdomid = '' (only required if deliverymode warrants)
                     * */
                }
            }
        } catch (e) {
            this.logger(methNm,'Exception: Could not render Create Show button.' + JSON.stringify(e),2);
        }
        
        // Select Show
        try {
            // Make sure we have a tree selected
            if ((sessionObj['tid'] != undefined) && (sessionObj['tid'] != '')) {
                if (true) { // Just leaving this here, in case another condition is required
                    this.logger(methNm,'Making the show select tool...',6);
                    // make the render tool
                    var cfgObj = {};
                    cfgObj.label = 'Select Show';
                    cfgObj.domidbase = 'notarealelementid';
                    //cfgObj.eventlisteners = {'onclick':'console.log(\'WOOFWOOF\')'};
                    //cfgObj.eventlisteners = {'onclick':'selectShow()'};
                    cfgObj.eventlisteners = {'onclick':'switchboard(\'buttshowselect\',\'\',{})'};
                    // switchboard('buttshowselect','',{})
                    cfgObj.cssclass = 'notarealclass';
                    cfgObj.presentationmode = 'htmlbut';
                    cfgObj.deliverymode = 'returnhtml';   // <<==== figure this out
                    cfgObj.targparentdomid = 'notatallrelevant';  // <<==== figure this out
                    
                    var pubToolDiv = this.__renderTool(cfgObj);
                    stdToolsDiv.innerHTML += pubToolDiv;
                    
                    /*
                     * Settings:
                     * label = ''
                     * domidbase = ''
                     * eventlisteners = {}
                     * cssclass = ''
                     * presentationmode = 'grbut'|'htmlbut'|'jslink'|'httplink'
                     * deliverymode = (same as actionControl classes)
                     * targparentdomid = '' (only required if deliverymode warrants)
                     * */
                }
            }
        } catch (e) {
            this.logger(methNm,'Exception: Could not render Select Show button.' + JSON.stringify(e),2);
        }
        
        // Admin User Accounts  // Have to have perms on the tree
        
        // Publish Script   // oid needs to be assettype == RMScript
        try {
            if (oidObj.hasOwnProperty('assettype')) {
                if (oidObj['assettype'] == 'RMScript') {
                    this.logger(methNm,'Making the render tool...',6);
                    // make the render tool
                    var cfgObj = {};
                    cfgObj.label = 'Render Script';
                    cfgObj.domidbase = 'notarealelementid';
                    cfgObj.eventlisteners = {'onclick':'switchboard(\'buttrenderscript\',\'\',{})'};
                    cfgObj.cssclass = 'notarealclass';
                    cfgObj.presentationmode = 'htmlbut';
                    cfgObj.deliverymode = 'returnhtml';   // <<==== figure this out
                    cfgObj.targparentdomid = 'notatallrelevant';  // <<==== figure this out
                    
                    var pubToolDiv = this.__renderTool(cfgObj);
                    stdToolsDiv.innerHTML += pubToolDiv;
                    
                    /*
                     * Settings:
                     * label = ''
                     * domidbase = ''
                     * eventlisteners = {}
                     * cssclass = ''
                     * presentationmode = 'grbut'|'htmlbut'|'jslink'|'httplink'
                     * deliverymode = (same as actionControl classes)
                     * targparentdomid = '' (only required if deliverymode warrants)
                     * */
                }
            }
        } catch (e) {
            this.logger(methNm,'Exception: Could not render Publish Script button.' + JSON.stringify(e),2);
        }

        // Child Object List Renumber   // There needs to be at least one child object and it needs to have the attribute 'seqnmbr'
        try {
            var childObjIdList = this.sse.rmSSEFetchTMeta()['childbyparent'][sOid];
            if (childObjIdList.length > 0) {
                var firstChildObjId = childObjIdList[0];
                var firstChildObj = this.sse.rmSSEOSRead(firstChildObjId);
                if (firstChildObj.hasOwnProperty('seqnmbr')) {
                    // DO THE RENUMBER
                    this.logger(methNm,'Making the rnumber tool...',6);
                    // make the render tool
                    var cfgObj = {};
                    cfgObj.label = 'Renumber Children';
                    cfgObj.domidbase = 'notarealelementid';
                    cfgObj.eventlisteners = {'onclick':'switchboard(\'buttcolrenum\',\'\',{})'};
                    // switchboard('buttrenderscript','',{})
                    cfgObj.cssclass = 'notarealclass';
                    cfgObj.presentationmode = 'htmlbut';
                    cfgObj.deliverymode = 'returnhtml';   // <<==== figure this out
                    cfgObj.targparentdomid = 'notatallrelevant';  // <<==== figure this out
                    
                    var pubToolDiv = this.__renderTool(cfgObj);
                    stdToolsDiv.innerHTML += pubToolDiv;
                } else {
                    // DON'T DO THE RENUMBER
                }
            } else {
                // DON"T DO THE RENUMBER
            }
        } catch (e) {
            this.logger(methNm,'Exception: Could not render Child Object List Renumber button.' + JSON.stringify(e),2);
        }
            
            
            

        
        //return stdToolsDiv;
        return su.disposeHtmlResult (stdToolsDiv.outerHTML,'returnhtml','');
        
    }
    __renderCustomTools(defObjIn) {
        var su = new RMSuperUtil();
        var custToolsDiv = document.createElement('div');
        return su.disposeHtmlResult (custToolsDiv.outerHTML,'returnhtml','');
    }
    render(custToolDefObjIn) {
        var methNm = 'render';
        this.logger(methNm,'BEGIN',6);
        var ctDefObj = {};
        if (custToolDefObjIn != undefined) {
            if (this.__validateCustToolsDef(custToolDefObjIn)) {
                ctDefObj = custToolDefObjIn;
            }
        }
        var oDiv = document.createElement('div');
        this.logger(methNm,'Calling __renderStockTools...',6);
        var sDivHtml = this.__renderStockTools();
        
        this.logger(methNm,'Calling __renderCustomTools with ' + JSON.stringify(ctDefObj) + '...',6);
        var xDivHtml = this.__renderCustomTools(ctDefObj);
        
        oDiv.innerHTML += sDivHtml;
        oDiv.innerHTML += xDivHtml;
        
        return oDiv;
    }
}
//Utilities for dealing with RMPC trees
class RMTreeUtil {
    constructor() {
        this.logUtil = new RMLogUtil('RMTreeUtil',3);
        this.sse = new RMSSSEnhanced();
    }
    logger(logMsgIn,lvlIn) {
        this.logUtil.logLim(logMsgIn,lvlIn);
    }
    //// THIS IS THE ONE WE WOULD USE IF WE WERE SMART
    loggerEnh (methNmIn,msgIn,lvlIn) {
        this.logUtil.log(methNmIn,msgIn,lvlIn);
    }
    __searchUpTree(startObjIdIn,srchKeyIn,srchValIn) {
        var methNm = '__searchUpTree';
        var retObj = undefined;
        
        var treeOSObj = this.sse.ssRead('treeos');
        var treeMeta = this.sse.rmSSEFetchTMeta();
        var curObj = treeOSObj[startObjIdIn];
        var curObjType = curObj['assettype'];
        
        var showObjFlag = false;
        var wrkObjId = startObjIdIn;
        while (showObjFlag == false) {
            if (wrkObjId == 0) {
                return {};
            }
            if (treeOSObj[wrkObjId][srchKeyIn] == srchValIn) {
                retObj = treeOSObj[wrkObjId];
                showObjFlag = true;
            } else {
                wrkObjId = treeMeta['parentbychild'][wrkObjId];
            }
        }
        return retObj;
    }
    atrListToObj(atrListIn){
        var retval = false;
        var retObj = {};
        for (var idx in atrListIn) {
            var atrObj = atrListIn[idx];
            var atrNm = atrObj['name']; 
            var atrVal = atrObj['value'];
            retObj[atrNm] = atrVal;
        }
        retval = retObj;
        return retval;
    }
    getShowCharObj(curObjIdIn) {
        var methNm = 'getShowCharObj';
        var retObj = {'COULD NOT':'Read Characters'};
        var validATypeList = ['RMShow','RMEpisode','RMScript','RMScriptAct','RMScriptScene','RMScriptEvent'];
        var treeOSObj = this.sse.ssRead('treeos');
        var treeMeta = this.sse.rmSSEFetchTMeta();
        var curObj = treeOSObj[curObjIdIn];
        var curObjType = curObj['assettype'];
        if (validATypeList.indexOf(curObjType) < 0 ) {
            var errMsg = '' + curObjIdIn + '(' + curObjType + ') is not a member of valid type list: ' + JSON.stringify(validATypeList) + ' - ABORTING';
            this.loggerEnh(methNm,errMsg,2);
            throw errMsg;
        }
        // We've gotten this far, so we should be able to walk back up the tree, get the "Show" object, and get its characterdict.
        
        
        var showObjFlag = false;
        var wrkObjId = curObjIdIn;
        while (showObjFlag == false) {
            if (treeOSObj[wrkObjId]['assettype'] == 'RMShow') {
                retObj = treeOSObj[wrkObjId]['characterdict'];
                showObjFlag = true;
            } else {
                wrkObjId = treeMeta['parentbychild'][wrkObjId];
            }
        }
        return retObj;
    }
    getScriptObj(curObjIdIn) {
        var methNm = 'getScriptObj';
        var retObj = {'COULD NOT':'Read Characters'};
        var treeOSObj = this.sse.ssRead('treeos');
        var treeMeta = this.sse.rmSSEFetchTMeta();
        var curObj = treeOSObj[curObjIdIn];
        try {
            var curObjType = curObj['assettype'];
        } catch(e) {
            this.loggerEnh(methNm,'Could not retrieve curObj.assettype',2);
            return retObj;
        }
        
        var validATypeList = ['RMShow','RMEpisode','RMScript','RMScriptAct','RMScriptScene','RMScriptEvent'];

        if (validATypeList.indexOf(curObjType) < 0 ) {
            var errMsg = '' + curObjIdIn + '(' + curObjType + ') is not a member of valid type list: ' + JSON.stringify(validATypeList) + ' - ABORTING';
            this.loggerEnh(methNm,errMsg,2);
            return retObj
        }
        
        var tmpRetObj = this.__searchUpTree(curObjIdIn,'assettype','RMScript');
        if (tmpRetObj) {
            retObj = tmpRetObj;
        }
        
        return retObj;
    }
    metaGetParentId(objIdIn) {
        var methNm = 'metaGetParentId';
        var retval;
        var logDebug = 2;
        this.loggerEnh(methNm,'BEGIN',logDebug);
        var treeMeta = this.sse.rmSSEFetchTMeta();
        
        try {
            retval = treeMeta['parentbychild'][objIdIn];
        } catch (e) {
            var errStr = 'EXCEPTION: COULD NOT FIND PBC FOR ' + objIdIn;
            this.logger(methNm,errStr,2);
            throw methNm + errStr;
        }
        return retval
        
    }
    metaGetChildList(parentIdIn) {
        var methNm = 'metaGetChildList';
        var logDebug = 2;
        this.loggerEnh(methNm,'BEGIN',logDebug);
        var retval = [];
        var treeMeta = this.sse.rmSSEFetchTMeta();
        try {
            retval = treeMeta['childbyparent'][parentIdIn];
        } catch (e) {
            var errStr = 'EXCEPTION: COULD NOT FIND CBP LIST FOR ' + parentIdIn;
            this.logger(methNm,errStr,2);
            throw methNm + errStr;
        }
        return retval
        
    }
    metaAddChildToParent(parentIdIn,childIdIn) {
        var methNm = 'addChildToParent';
        var logDebug = 2;
        this.loggerEnh(methNm,'BEGIN',logDebug);
        var treeMeta = this.sse.rmSSEFetchTMeta();
        var childList;
        try {
            childList = treeMeta['childbyparent'][parentIdIn];
        } catch (e) {
            this.logger(methNm,'EXCEPTION: COULD NOT FIND CBP LIST FOR ' + parentIdIn,2);
            return false;
        }
        var childAddFlag = false;
        try {
            if (childList.length > 0) {
                this.loggerEnh(methNm,'Child list has elements',logDebug);
                // List has elements.  Do the thing.
                var exChildIdx = childList.indexOf(childIdIn);
                if (exChildIdx < 0) {
                    this.loggerEnh(methNm,'Child ID is not in current list',logDebug);
                    // Child is not already in list.  Add to child list.
                    childAddFlag = true;
                } else {
                    // Skip it.  It's already there.
                    this.loggerEnh(methNm,'Child ID is already in current list',logDebug);
                }
            } else {
                // List has no elements.  Do the thing.
                this.loggerEnh(methNm,'Child list has no elements',logDebug);
                childAddFlag = true;
            }
        } catch (e) {
            this.loggerEnh(methNm,'EXCEPTION - Problem with childList: ' + JSON.stringify(e),2);
        }
        if (childAddFlag == true) {
            this.loggerEnh(methNm,'Adding child to list',logDebug);
            childList.push(childIdIn);
            treeMeta['childbyparent'][parentIdIn] = childList;
            this.sse.rmSSEStoreTMeta(treeMeta);
        }
        this.loggerEnh(methNm,'DONE',logDebug);
        return childAddFlag;
    }
    metaRemoveChildFromParent(parentIdIn,childIdIn) {
        var methNm = 'removeChildFromParent';
        var logDebug = 2;
        this.loggerEnh(methNm,'BEGIN',logDebug);
        var treeMeta = this.sse.rmSSEFetchTMeta();
        var childList;
        try {
            childList = treeMeta['childbyparent'][parentIdIn];
        } catch (e) {
            this.logger(methNm,'EXCEPTION: COULD NOT FIND CBP LIST FOR ' + parentIdIn,2);
            return false;
        }

        var exChildIdx = -100;
        var childActionFlag = false;
        if (childList.length > 0) {
            this.loggerEnh(methNm,'Child list has elements',logDebug);
            // List has elements.  Do the thing.
            exChildIdx = childList.indexOf(childIdIn);
            if (exChildIdx < 0) {
                this.loggerEnh(methNm,'Child ID is not in current list',logDebug);
                // Child is not already in list.  Add to child list.
            } else {
                // Skip it.  It's already there.
                this.loggerEnh(methNm,'Child ID is already in current list',logDebug);
                childActionFlag = true;
            }
        } else {
            // List has no elements.  Do the thing.
            this.loggerEnh(methNm,'Child list has no elements',logDebug);
        }
        if (childActionFlag == true) {
            this.loggerEnh(methNm,'Adding child to list',logDebug);
            childList.splice(exChildIdx,1);
            treeMeta['childbyparent'][parentIdIn] = childList;
            this.sse.rmSSEStoreTMeta(treeMeta);
        }
        this.loggerEnh(methNm,'DONE',logDebug);
        return childActionFlag;
    }
    updatePersistCache (targObjIn) { // TICKET [c39aac2beb4c5560a0cc2f8f7e25be05e3eec53d]
        var methNm = 'updatePersistCache';
        var retval = false;
        var pcObj = this.sse.ssOKRead('misc','persistcache');
        var toType ;
        try {
            toType = targObjIn['assettype'];
        } catch (e) {
            this.loggerEnh(methNm,'Poop! - ' + JSON.stringify(e),2);
            return retval;
        }
        this.loggerEnh(methNm,'toType: ' + toType,2);
        switch (toType) {
            case 'RMShow':
                pcObj['scriptid'] = null;
                pcObj['episodeid'] = null;
                pcObj['showid'] = targObjIn['id']; //assettype
                retval = true;
                break;
            case 'RMEpisode':
                var tu = new RMTreeUtil();
                pcObj['scriptid'] = null;
                pcObj['episodeid'] = targObjIn['id'];
                pcObj['showid'] = this.metaGetParentId(pcObj['episodeid']);
                retval = true;
                break;
            case 'RMScript':
            case 'RMScriptAct':
            case 'RMScriptScene':
                var tu = new RMTreeUtil();
                pcObj['scriptid'] = targObjIn['id'];
                pcObj['episodeid'] = this.metaGetParentId(pcObj['scriptid']);
                pcObj['showid'] = this.metaGetParentId(pcObj['episodeid']);
                retval = true;
                break;
            
            default:
                this.loggerEnh(methNm,'Poop! - Unrecognized object type: ' + toType,2);
                pcObj['scriptid'] = null;
                pcObj['episodeid'] = null;
                pcObj['showid'] = null;                
                break;
        }
        try {
            this.sse.ssOKWrite('misc','persistcache',pcObj);
        } catch (e) {
            this.loggerEnh(methNm,"Could not write Persist Cache: " + JSON.stringify(e),2);
            retval = false;
        }
        return retval;
    }
    getPersistCache() {
        return this.sse.ssOKRead('misc','persistcache');
    }
    
}
// Contains methods which act as generalized consolidating wrappers 
// around  SessionStorage oriented toward using it as a state cache for 
// a running web app
class RMSessionStoreUtil {
    constructor() {
        this.logUtil = new RMLogUtil('RMSessionStoreUtil',3);
    }
    logger (methNmIn,MsgIn,lvlIn) {
        this.logUtil.log(ethNmIn,MsgIn,lvlIn);
    }
    // Base SessionStorage Utilities
    // Initialize storage based on template object passes in
    sstorInit (ssTemplIn) {
        var metaObj = {};
        for (var mtIdx in ssTemplIn) {
            metaObj[ssTemplIn[mtIdx]['name']] = ssTemplIn[mtIdx];
        }
        sessionStorage.setItem('ssmeta',JSON.stringify(metaObj));
        for (var sstIdx in ssTemplIn) {
            var dObj = ssTemplIn[sstIdx];
            sessionStorage.setItem(dObj['name'],dObj['content']);
        }
    }
    // Fetch SessionStorage Item Type Definitions
    ssMetaFetch () {
        var ssmObj = JSON.parse(sessionStorage.getItem('ssmeta'));
        return ssmObj;
    }
    // Write to SessionStorage Item
    ssWrite(keyIn,valIn) {
        var ssmObj = this.ssMetaFetch();
        var kmType = ssmObj[keyIn]['type'];
        var writeVal = valIn;
        if ((kmType == 'dict') || (kmType == 'list')) {
            writeVal = JSON.stringify(valIn);
        }
        sessionStorage.setItem(keyIn,writeVal);
        return true;
    }
    // Delete SessionStorage Item
    ssDelete(keyIn) {
        sessionStorage.removeItem(keyIn);
        return true;
    }
    // Read from SessionStorage Item
    ssRead(keyIn) {
        var ssmObj = this.ssMetaFetch();
        var kmType = ssmObj[keyIn]['type'];
        var rawVal = sessionStorage.getItem(keyIn);
        var retval = rawVal;
        if ((kmType == 'dict') || (kmType == 'list')) {
            retval = JSON.parse(rawVal);
        }
        return retval;
    }
    // Write to One Key in an Object stored in a SessionStorage Item
    ssOKWrite(keyIn,subKeyIn,valIn) {
        var startObj = this.ssRead(keyIn);
        startObj[subKeyIn] = valIn;
        return this.ssWrite(keyIn,startObj);
    }
    // Read from One Key in an Object stored in a SessionStorage Item
    ssOKRead(keyIn,subKeyIn) {
        var startObj = this.ssRead(keyIn);
        return startObj[subKeyIn];
    }
    // Delete One Key from an Object stored in a SessionStorage Item
    ssOKDelete(keyIn,subKeyIn) {
        var tmpObj = this.ssRead(keyIn);
        delete tmpObj[subKeyIn];
        this.ssWrite(keyIn,tmpObj);
    }
    // Write to Object representing one DOM Element in the 'domeldata' StorageSession Item
    dedWrite(elIdIn,valIn) {
        var ddObj = this.dedRead();
        ddObj[elIdIn] = JSON.stringify(valIn);
        this.ssWrite('domeldata',JSON.stringify(ddObj));
        return true;
    }
    // Read Object representing one DOM Element in the 'domeldata' StorageSession Item
    dedRead(elIdIn) {
        var ddObj = JSON.parse(this.ssRead('domeldata'));
        return ddObj[elIdIn];
    }
    // EXAMPLE RIBBBIT media Storage Initialization
    rmSStorInitExample () {
        var sstorTemplObj = [];
        sstorTemplObj.push({'name':'treemeta','type':'dict','content':'{}'}); // Tree Metadata
        sstorTemplObj.push({'name':'treeotypemeta','type':'dict','content':'{}'}); // Tree Object Type Metadata (types for fields within an object)
        sstorTemplObj.push({'name':'treeos','type':'dict','content':'{}'}); // Tree Object Store
        sstorTemplObj.push({'name':'treedirty','type':'list','content':'[]'}); // List of "dirty" Tree Objects
        sstorTemplObj.push({'name':'localcfg','type':'dict','content':'{}'}); // Configuration for this execution
        sstorTemplObj.push({'name':'domeldata','type':'dict','content':'{}'}); //data related to an element is stored in an object embedded in this object, its key being its DOM element ID
        sstorTemplObj.push({'name':'localsession','type':'dict','content':'{}'});
        sstorTemplObj.push({'name':'misc','type':'dict','content':'{}'});
        sstorInit(sstorTemplObj);
        return true;
    }
}
// Contains a set of methods which extend the functionality of 
// RMSessionStoreUtil to cater to the needs of RMPordCo.
class RMSSSEnhanced extends RMSessionStoreUtil {
    constructor() {
        super();
        this.logUtil = new RMLogUtil('RMSSSEnhanced',3);
    }
    logger (methNmIn,msgIn,lvlIn) {
        this.logUtil.log(methNmIn,msgIn,lvlIn);
    }
    loggerEnh(methNmIn,msgIn,lvlIn) {
        this.logger(methNmIn,msgIn,lvlIn);
    }
    objKeyPopCheck(tObjIn,keyListIn,badValListIn) {
        var methNm = 'objKeyPopCheck';
        // Before we get too carried away, let's make sure we have the values we need
        var sessObj = tObjIn;
        var keyList = keyListIn;
        var invalidList = badValListIn;
        try {
            var kll = keyList.length;
            this.loggerEnh(methNm,JSON.stringify(sessObj) + ' \n' + JSON.stringify(keyList) + ' \n' + JSON.stringify(invalidList),6);
            for (var kIdx=0; kIdx<kll; kIdx++) {
                this.loggerEnh(methNm,'In the loop with kIdx: ' + kIdx,6);
                var keyNm = keyList[kIdx]
                var sessKeyVal = sessObj[keyNm];
                this.loggerEnh(methNm,'checking key ' + keyList[kIdx] + ' with value: ' + sessKeyVal,6);
                if (invalidList.indexOf(sessKeyVal) > -1) {
                    // We've found an invalid value
                    var eMsg = 'Found key ' + keyList['kIdx'] + ' had invalid value: ' + sessKeyVal;
                    throw eMsg;
                }
            }
        } catch (e) {
            this.loggerEnh(methNm,'EXCEPTION: ' + JSON.stringify(e),4);
            return false;
        }
        return true;
    }
    // Write session data object to SessionStorage
    rmSSEStoreSession(sessObjIn) {
        sessObjIn['token'] = sessObjIn['stoken'];
        sessObjIn['sid'] = sessObjIn['stoken'];
        return this.ssWrite('localsession',sessObjIn);
    }
    // Read session data object from SessionStorage
    rmSSEFetchSession() {
        var methNm = 'rmSSEFetchSession';
        var retval = false;
        var sessObj = {};
        

        try {
            sessObj = this.ssRead('localsession');
        } catch (e) {
            this.logger(methNm,'EXCEPTION!  Local session fetch FAILED: ' + JSON.stringify(e),2);
            throw e;
            return retval;
        }
        retval = sessObj;
        return retval;
    }
    // Write Tree Meta data object to SessionStorage
    rmSSEStoreTMeta(tMetaObjIn) {
        return this.ssWrite('treemeta',tMetaObjIn);
    }
    // Read Tree Meta data object from SessionStorage
    rmSSEFetchTMeta() {
        return this.ssRead('treemeta');
    }
    // Read a single Tree Object Store object from SessionStorage
    rmSSEOSRead(objIdIn) {
        return this.ssOKRead('treeos',objIdIn);
    }
    // Write a locally changed "Tree Object Store" object to the 
    // Tree Object Store
    rmSSEOSLocalWrite(objObjIn) {
        var methNm = 'rmSSEOSLocalWrite';
        var oId = objObjIn.id;
        var r0 = this.ssOKWrite('treeos',oId,objObjIn);
        var r1 = this.rmSSEObjMarkDirty(oId);
        var r2 = this.rmSSEObjMarkNotFresh(oId);
        // Need to confirm that the Mark[Not][Dirty,Fresh] functions return 
        // sensibly, before integrating them with the output from the actual write
        if (!!document.getElementById(oId + '-ocv')) {
            this.logger(methNm, 'This is where, if we were at all clever, we would update the field values in the OCV for ' + oId,6);
            var ocv = new RMPCObjectContentView(objObjIn);
            ocv.refreshValues();
        }
        return (r0 & r1 & r2);
    }
    rmSSEOSSimpleWrite(objObjIn) {
        var methNm = 'rmSSEOSSimpleWrite - ';
        var oId = objObjIn.id;
        var r0 = this.ssOKWrite('treeos',oId,objObjIn);
        var r1 = true;
        var r2 = true;
        // Need to confirm that the Mark[Not][Dirty,Fresh] functions return 
        // sensibly, before integrating them with the output from the actual write
        //if (!!document.getElementById(oId + '-ocv')) {
            //console.log('rmSSEOSLocalWrite - This is where, if we were at all clever, we would update the field values in the OCV for ' + oId);
            //var ocv = new RMPCObjectContentView(oId);
            //ocv.refreshValues();
        //}
        return (r0 & r1 & r2);
    }
    // Write DB-refreshed "Tree Object Store" object to the Tree Object Store
    rmSSEOSRefreshWrite(objObjIn) {
        if (objObjIn == undefined) {
            console.log('rmSSEOSRefreshWrite - OBJECT IS NOT DEFINED - ABORTING!\n');
            return false;
        }
        if (! (objObjIn.hasOwnProperty('id'))) {
            console.log('rmSSEOSRefreshWrite - OBJECT DOES NOT HAVE PROPERTY "id" - ABORTING!\n' + JSON.stringify(objObjIn));
            return false;
        }
        var oId = objObjIn.id;
        var r0 = this.ssOKWrite('treeos',oId,objObjIn);
        var r1 = this.rmSSEObjMarkNotDirty(oId);
        var r2 = this.rmSSEObjMarkFresh(oId);
        
        // Need to confirm that the Mark[Not][Dirty,Fresh] functions return 
        // sensibly, before integrating them with the output from the actual write
        
        if (!!document.getElementById(oId + '-ocv')) {
            //console.log('rmSSEOSLocalWrite - This is where, if we were at all clever, we would update the field values in the OCV for ' + oId);
            var ocv = new RMPCObjectContentView(oId);
            ocv.refreshValues();
        } else {
        }

        return (r0 & r1 & r2);
    }
    // 
    rmSSEOSRefreshWriteONC(objObjIn) {
        var metaObj = this.rmSSEFetchTMeta();
        var cbpList = [];
        var oPrime = objObjIn['object'];
        var parentId = oPrime['id'];
        var retval = this.rmSSEOSRefreshWrite(oPrime);
        var childList = objObjIn['children'];
        for (var coIdx in childList) {
            var tmpResult = this.rmSSEOSRefreshWrite(childList[coIdx]);
            cbpList.push(childList[coIdx]['id']);
            metaObj['parentbychild'][childList[coIdx]['id']] = parentId;
            retval = (retval & tmpResult);
        }
        metaObj['childbyparent'][parentId] = cbpList;
        this.rmSSEStoreTMeta(metaObj);
        return retval;
    }
    // OK, this has just been copied, and I'm almost certain it's totally broken for this application.
    // Fix as required.
    rmSSEOSRefreshWriteONCAA(objObjIn) {
        var retval = false;
        var methNm = 'rmSSEOSRefreshWriteONCAA';
        var metaObj = this.rmSSEFetchTMeta();
        var localMetaList = ['childbyparent','parentbychild','keylist'];
        var tmpMetaAtrObj = objObjIn['meta'];
        var tmpOsAtrObj = objObjIn['objectstore'];
        var tu = new RMTreeUtil();
        
        // OK, let's go through the Meta Data
        var tmpMetaObj = tu.atrListToObj(tmpMetaAtrObj);
        this.logger(methNm,'typeof tmpMetaObj: ' + typeof tmpMetaObj,6);
        
        for (var lmlIdx in localMetaList) {
            var mKey = localMetaList[lmlIdx];
            this.logger(methNm,'working on ' + mKey,6);
            if (typeof tmpMetaObj == 'object') {
                if (tmpMetaObj.hasOwnProperty(mKey)) {
                    metaObj[mKey] = tmpMetaObj[mKey]
                    this.logger(methNm,'Set key ' + mKey + ' to: ' + JSON.stringify(tmpMetaObj[mKey]),6);
                } else {
                    //gah, this is bad
                    this.logger(methNm,'tmpMetaObj does not have key ' + mKey,2);
                }
                
            } else {
                //gah, this is bad
                this.logger(methNm,'tmpMetaObj is not an object! ' + JSON.stringify(tmpMetaObj),2);
            }
        }
        retval = this.rmSSEStoreTMeta(metaObj);
        
        // Now, let's go through the ObjectStore
        try {
            var tmpOsList = Object.keys(tmpOsAtrObj);
        } catch (e) {
            var eMsg = 'Could not write ' + JSON.stringify(objObjIn) + ' because there was a problem with tmpOsAtrObj: ' +JSON.stringify(e);
            this.loggerEnh(methNm,eMsg,2);
            throw eMsg;
            return false;
        }
        for (var oslIdx in tmpOsList) {
            var osKey = tmpOsList[oslIdx];
            var osObj = tu.atrListToObj(tmpOsAtrObj[osKey]);
            var tmpResult = this.rmSSEOSRefreshWrite(osObj);
            retval = (retval & tmpResult);
        }
        return retval;
    }
    // Similar to rmSSEOSRefreshWriteONCAA, except does not set refresh.
    rmSSEOSNoRefreshWriteONCAA(objObjIn) {  // <<===  CONTAINS DEADWOOD
        var methNm = 'rmSSEOSNoRefreshWriteONCAA - ';
        var retval = false;
        var metaObj = this.rmSSEFetchTMeta();
        var localMetaList = ['childbyparent','parentbychild','keylist'];
        var tmpMetaAtrObj = objObjIn['meta'];
        var tmpOsAtrObj = objObjIn['objectstore'];
        var tu = new RMTreeUtil();
        
        // OK, let's go through the Meta Data
        var tmpMetaObj = tu.atrListToObj(tmpMetaAtrObj);
        
        for (var lmlIdx in localMetaList) {
            var mKey = localMetaList[lmlIdx];
            this.logger(methNm,'Working on ' + mKey,6);
            if (typeof tmpMetaObj == 'object') {
                if (tmpMetaObj.hasOwnProperty(mKey)) {
                    metaObj[mKey] = tmpMetaObj[mKey]
                } else {
                    //gah, this is bad
                    this.logger(methNm,'tmpMetaObj does not have key ' + mKey,2);
                }
                
            } else {
                //gah, this is bad
                this.logger(methNm,'tmpMetaObj is not an object! ' + JSON.stringify(tmpMetaObj),2);
            }
        }
        retval = this.rmSSEStoreTMeta(metaObj);
        
        // MAYBE THERE'S A MORE EFFICIENT WAY TO DO THIS
        // Now, let's go through the ObjectStore
        var tmpOsList = Object.keys(tmpOsAtrObj);
        var tmpLocalTreeOS = this.ssRead('treeos');
        var tmpDirtyList = [];
        for (var oslIdx=0; oslIdx<tmpOsList.length; oslIdx++) {
            var osKey = tmpOsList[oslIdx];
            var osObj = tu.atrListToObj(tmpOsAtrObj[osKey]);
            var tmpOSOId = osObj['id'];
            tmpLocalTreeOS[tmpOSOId] = osObj;
            tmpDirtyList.push(tmpOSOId);
        }
        this.ssWrite('treeos',tmpLocalTreeOS);
        return retval;
    }
    // Mark a "Tree Object Store" object as "Dirty"
    rmSSEObjMarkDirty(objIdIn) {
        var methNm = 'rmSSEObjMarkDirty';
        var retval = false;
        var dirtyList = this.ssRead('treedirty');
        this.logger(methNm,'dirtyList: ' + JSON.stringify(dirtyList),6);
        var oDLIdx = dirtyList.indexOf(objIdIn);
        if (oDLIdx < 0) {
            this.logger(methNm,' - ' + objIdIn,6);
            dirtyList.push(objIdIn);
            retval = this.ssWrite('treedirty',dirtyList);

            var indicatorDEl = false;
            try {
                var tmpIndDEl = document.getElementById(objIdIn + '-cltbl-col1');
                var junk = tmpIndDEl.id;
                indicatorDEl = tmpIndDEl;
            } catch (e) {
                this.loggerEnh(methNm,'Looks like we\'re not dealing with a Child Object')
                try {
                    var tmpIndDEl = document.getElementById(objIdIn + '-ocv');
                    var junk = tmpIndDEl.id;
                    indicatorDEl = tmpIndDEl;
                } catch (e) {
                    this.loggerEnh(methNm,'Looks like we\'re not dealing with a stand-along object. ')
                }
            }
            if (indicatorDEl) {
                indicatorDEl.style.backgroundColor = '#ff8888';
            }
        }
        return retval
    }
    // Mark a "Tree Object Store" object as "Not Dirty"
    rmSSEObjMarkNotDirty(objIdIn) {
        var methNm = 'rmSSEObjMarkNotDirty';
        var retval = false;
        var dirtyList = this.ssRead('treedirty');
        var lIdx = dirtyList.indexOf(objIdIn)
        if (lIdx > -1) {
            dirtyList.splice(lIdx,1);
            retval = this.ssWrite('treedirty',dirtyList);

            var indicatorDEl = false;
            try {
                var tmpIndDEl = document.getElementById(objIdIn + '-cltbl-col1');
                var junk = tmpIndDEl.id;
                indicatorDEl = tmpIndDEl;
            } catch (e) {
                this.loggerEnh(methNm,'Looks like we\'re not dealing with a Child Object')
                try {
                    var tmpIndDEl = document.getElementById(objIdIn + '-ocv');
                    var junk = tmpIndDEl.id;
                    indicatorDEl = tmpIndDEl;
                } catch (e) {
                    this.loggerEnh(methNm,'Looks like we\'re not dealing with a stand-along object. ')
                }
            }
            if (indicatorDEl) {
                indicatorDEl.style.backgroundColor = '#88ff88';
            }
        }
        return retval;
    }
    // Mark a "Tree Object Store" object as "Fresh"
    rmSSEObjMarkFresh(objIdIn) {
        var retval = false;
        var freshList = this.ssRead('treefresh');
        if (freshList.indexOf(objIdIn) == -1) {
            freshList.push(objIdIn);
            retval = this.ssWrite('treefresh',freshList);
        }
        return retval;
    }
    // Mark a "Tree Object Store" object as "Not Fresh"
    rmSSEObjMarkNotFresh(objIdIn) {
        var retval = false;
        var freshList = this.ssRead('treefresh');
        var lIdx = freshList.indexOf(objIdIn);
        if (lIdx > -1) {
            freshList.splice(lIdx,1);
            retval = this.ssWrite('treefresh',freshList);
        }
        return retval;
    }
    rmSSEMiscLLStore(keyIn,valIn) {
        this.ssOKWrite('misc',keyIn,valIn)
    }
    rmSSEMiscLLCheck(keyIn) {
        var retval = false;
        var miscObj = this.ssRead('misc');
        if (miscObj.hasOwnProperty(keyIn)) {
            var kv = miscObj[keyIn];
            var kvt = typeof kv;
            // differential handling of kv based on type
            if (kv) {
                switch (kvt) {
                    case 'object':
                        retval = true;
                        break;
                    case 'number':
                        retval = true;
                        break;
                    case 'string':
                        retval = true;
                        break;
                    case 'boolean':
                        retval = true;
                        break;
                    default:
                        console.log('rmSSEMiscLLCheck - Do not recognize type ' + kvt + ' for key ' + keyIn);
                        break;
                }
            }
        }
        return retval;
    }
    rmSSEMiscLLReadDel(keyIn) {
        var retval = false;
        if (this.rmSSEMiscLLCheck(keyIn)) {
            var miscObj = this.ssRead('misc');
            retval = miscObj[keyIn];
            delete miscObj[keyIn];
            this.ssWrite('misc',miscObj);
        }
        return retval;
    }
}
// Contains methods for placing API calls, and dealing with the 
// responses in a uniform and robust way.  Depends on RMSSSEnhanced for 
// config data and user data source/sink
class RMAPI {
    constructor () {
        this.sse = new RMSSSEnhanced();
        this.logUtil = new RMLogUtil('RMAPI',3);
        this.su = new RMSessionUtil();
    }
    logger (MsgIn,lvlIn) {
        this.logUtil.logLim(MsgIn,lvlIn);
    }
    //// THIS IS THE ONE WE WOULD USE IF WE WERE SMART
    loggerEnh (methNmIn,msgIn,lvlIn) {
        this.logUtil.log(methNmIn,msgIn,lvlIn);
    }
    // BEGIN COMMON API CALLS
    // This will require a new REST endpoint on the API, and saves us from 
    // embedding a bunch of dynamically-generated JavaScript in the page load
    rmAPIfetchConfig(sessionIdIn) {
        // placeholder for faking it until we make it
        return this.fakeAPIFetchConfig();
    }
    // As the name suggests, this is just here to fake a fetch from the API 
    // for config info
    fakeAPIFetchConfig() {
        var cObj = {};
        cObj.apihost = 'localhost';
        console.log('fakeAPIFetchConfig: ' + JSON.stringify(cObj));
    }
    
    
    // Fetch the whole freezer blob and write it to storage
    // Then execute the provided callback function, if any.
    rmAPIFreezerFetchBlob(cbFuncIn) {
        var methNm = 'rmAPIFreezerFetchBlob - ';
        var llError = 2;
        var llWarn = 3;
        var llDebug = 4;
        var llInfo = 5;
        
        const apiEndpoint = '/api/blob/get'; 
        const bodyDataStr = JSON.stringify({});
        
        var metaCBFunc = function (blobObjIn) {
            var sse = new RMSSSEnhanced();
            sse.ssWrite('blob',blobObjIn);
            cbFuncIn(blobObjIn);
        }
        
        this.rmAPIPostGeneric(apiEndpoint,bodyDataStr,metaCBFunc);
    }
    // Write the whole freezer blob to the API, and execute a callback 
    // function (if provided)
    rmAPIFreezerSendBlob(cbFuncIn) {
        var methNm = 'rmAPIFreezerSendBlob - ';
        var llDebug = 2;
        
        var blob = this.sse.ssRead('blob');
        
        const apiEndpoint = '/api/blob/put';
        const bodyDataStr = JSON.stringify(blob);
        
        //this.rmAPIPostGeneric(apiEndpoint,bodyDataStr,cbFuncIn);
        this.rmAPIPostGeneric(apiEndpoint,blob,cbFuncIn);
    }
    
    // THIS IS NEW!!!  THIS IS A GENERIC API POST METHOD WITH CALLBACKS FOR
    // HTTP STATUS 2XX, 4XX, and 5XX
    rmAPIPostGeneric(epStrIn,postDataObjIn,cb2xxFuncIn,cb4xxFuncIn,cb5xxFuncIn){
        var methNm = 'rmAPIPostGeneric';
        var llDebug = 2;
        const apiEndpoint = epStrIn;
        const bodyDataStr = JSON.stringify(postDataObjIn);

        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            var methNm = 'onreadystatechange';
            var responseObj;
            // If we're done...
            if (this.readyState == 4) {
                // If we got back a 2XX response code
                if (([200,201,202].indexOf(this.status) > -1)) {
                    if (cb2xxFuncIn) {
                        responseObj = JSON.parse(this.responseText);
                        cb2xxFuncIn(responseObj);
                    } else {
                        console.log('rmAPIFreezerPostGeneric - Status: ' + this.status + ' but no callback function was provided.');
                    }
                // If we got back a 4XX response code
                } else if (((this.status % 400) <= 99)) {
                    if (cb4xxFuncIn) {
                        responseObj = JSON.parse(this.responseText);
                        cb4xxFuncIn(responseObj);
                    } else {
                        console.log('rmAPIFreezerPostGeneric - Status: ' + this.status + ' but no callback function was provided.');
                    }
                // If we got back a 5XX response code
                 } else if (((this.status % 500) <= 99)) {
                    if (cb5xxFuncIn) {
                        responseObj = JSON.parse(this.responseText);
                        cb5xxFuncIn(responseObj);
                    } else {
                        console.log('rmAPIFreezerPostGeneric - Status: ' + this.status + ' but no callback function was provided.');
                    }
                }
            } else {
                console.log('rmAPIPostGeneric - ' + epStrIn + ': this.readyState = ' + this.readyState);
            }
                
        };
        xhttp.open("POST", apiEndpoint, true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(bodyDataStr);
    }
    
    rmAPIFreezerUPCLookupDesc(cbFuncIn,upcIn) {
        var methNm = 'rmAPIFreezerUPCLookupDesc - ';
        var llError = 2;
        var llWarn = 3;
        var llDebug = 4;
        var llInfo = 5;
        const apiEndpoint = '/api/upc/gettitle/' + upcIn;
        const bodyDataStr = JSON.stringify({});
        this.loggerEnh(methNm,'apiEndpoint: ' + apiEndpoint,2);
        
        this.rmAPIPostGeneric(apiEndpoint,{},cbFuncIn);
    }
    
    rmAPIFreezerUPCLookup(cbFuncOKIn,upcIn,cbFuncBadIn) {
        var methNm = 'rmAPIFreezerUPCLookupDesc - ';
        var llError = 2;
        var llWarn = 3;
        var llDebug = 4;
        var llInfo = 5;
        const apiEndpoint = '/api/upc/get/' + upcIn;
        this.loggerEnh(methNm,'apiEndpoint: ' + apiEndpoint,2);

        this.rmAPIPostGeneric(apiEndpoint,{},cbFuncOKIn,cbFuncBadIn,cbFuncBadIn);
    }
    
    
    
    
    // I think there's already an endpoint for this, and it's kinda been 
    // done in the old UI, but it needs to be done better, and using the 
    // SessionStorage model rather than hiding data in hidden DIVs.
    rmAPIFetchTargetObjAndChildren() {
        return {};
    }
    // config keys for SS:
    // apibaseuri    // API Base URI
    // apiepsof      // API Endpoint - Single Object Fetch
    // apiepsou      // API Endpoint - Single Object Update
    
    // Fetch a single Object from the API, place it in the Object Store and 
    // mark it as "fresh"
    //rmAPIFetchSingleObject(ctrlObj,dataObj) {
    rmAPIFetchSingleObject(objIdIn) {
        var methNm = 'rmAPIFetchSingleObject - ';
        var llError = 2;
        var llWarn = 3;
        var llDebug = 4;
        var llInfo = 5;
        // THIS WILL PROBABLY REQUIRE SOME REWORK -- Rather than making all 
        // the calling entities build special data objects and control 
        // objects, we can just pull in those values from SessionStore
        var sCfg = this.sse.ssRead('localcfg');
        const apiEndpoint = sCfg.apibaseuri + sCfg.apiepsof + '/' + objIdIn;
        logger('apiEndpoint: ' + apiEndpoint);

        var tmpSession = this.sse.rmSSEFetchSession();
        var dataObj = {};
        dataObj.sid = tmpSession.token;
        dataObj.tid = tmpSession.treeid;
        dataObj.oid = objIdIn;
        //dataObj['toid'] = objIdIn;
        
        logger(methNm + 'BEGIN',llDebug);
        const bodyDataStr = JSON.stringify(dataObj);
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            var sse = new RMSSSEnhanced();
            if (this.readyState == 4 && this.status == 200) {
                var responseObj = JSON.parse(this.responseText);
                // console.log('Got back this.responseText: ' + this.responseText);
                sse.rmSSEOSRefreshWrite(responseObj);
                //console.log('just called rmSSEOSRefreshWrite ');
            }
        };
        //logger('Done setting up XMLHttpRequest',llDebug);
        xhttp.open("POST", apiEndpoint, true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(bodyDataStr);
    }
    // objReadWithChildren
    // Fetch a single Object from the API, place it in the Object Store and 
    // mark it as "fresh"
    //rmAPIFetchSingleObject(ctrlObj,dataObj) {
    rmAPIFetchSingleObjectWithChildren(objIdIn) {
        var methNm = 'rmAPIFetchSingleObjectWithChildren - ';
        var llError = 2;
        var llWarn = 3;
        var llDebug = 4;
        var llInfo = 5;
        // THIS WILL PROBABLY REQUIRE SOME REWORK -- Rather than making all 
        // the calling entities build special data objects and control 
        // objects, we can just pull in those values from SessionStore
        var sCfg = this.sse.ssRead('localcfg');
        
        const apiEndpoint = sCfg.apibaseuri + sCfg.apiepsofwc + '/' + objIdIn;
        //logger('apiEndpoint: ' + apiEndpoint);

        var tmpSession = this.sse.rmSSEFetchSession();
        var dataObj = {};
        if (tmpSession.hasOwnProperty('token')) {
            dataObj.sid = tmpSession.token;
        } else if (tmpSession.hasOwnProperty('stoken')){
            dataObj.sid = tmpSession.stoken;
        } else if (tmpSession.hasOwnProperty('sid')){
            dataObj.sid = tmpSession.sid;
        }
        if (tmpSession.hasOwnProperty('tid')) {
            dataObj.tid = tmpSession.tid;
        } else if (tmpSession.hasOwnProperty('treeid')) {
            dataObj.tid = tmpSession.treeid;
        }
        dataObj.oid = objIdIn;
        //dataObj['toid'] = objIdIn;
        
        //logger(methNm + 'BEGIN',llDebug);
        const bodyDataStr = JSON.stringify(dataObj);
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            var sse = new RMSSSEnhanced();
            if (this.readyState == 4 && this.status == 200) {
                var responseObj = JSON.parse(this.responseText);
                //console.log('Got back this.responseText: ' + this.responseText);
                sse.rmSSEOSRefreshWriteONC(responseObj);
                //console.log('just called rmSSEOSRefreshWriteONC ');
            }
        };
        //logger('Done setting up XMLHttpRequest',llDebug);
        xhttp.open("POST", apiEndpoint, true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(bodyDataStr);
    }
    // objReadWithChildrenAndAncestors
    // Fetch a single Object from the API, place it in the Object Store and 
    // mark it as "fresh"
    //rmAPIFetchSingleObject(ctrlObj,dataObj) {
    rmAPIFetchSingleObjectWithChildrenAndAncestors(objIdIn) {
        var methNm = 'rmAPIFetchSingleObjectWithChildrenAndAncestors - ';
        var llError = 2;
        var llWarn = 3;
        var llDebug = 4;
        var llInfo = 5;
        // THIS WILL PROBABLY REQUIRE SOME REWORK -- Rather than making all 
        // the calling entities build special data objects and control 
        // objects, we can just pull in those values from SessionStore
        var sCfg = this.sse.ssRead('localcfg');
        
        const apiEndpoint = sCfg.apibaseuri + sCfg.apiepsofwca + '/' + objIdIn;
        //this.logger(methNm + 'apiEndpoint: ' + apiEndpoint,2);

        var tmpSession = this.sse.rmSSEFetchSession();
        var dataObj = {};
        if (tmpSession.hasOwnProperty('token')) {
            dataObj.sid = tmpSession.token;
        } else if (tmpSession.hasOwnProperty('stoken')){
            dataObj.sid = tmpSession.stoken;
        } else if (tmpSession.hasOwnProperty('sid')){
            dataObj.sid = tmpSession.sid;
        }
        if (tmpSession.hasOwnProperty('tid')) {
            dataObj.tid = tmpSession.tid;
        } else if (tmpSession.hasOwnProperty('treeid')) {
            dataObj.tid = tmpSession.treeid;
        }
        dataObj.oid = objIdIn;
        //dataObj['toid'] = objIdIn;
        
        //logger(methNm + 'BEGIN',llDebug);
        const bodyDataStr = JSON.stringify(dataObj);
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            var sse = new RMSSSEnhanced();
            if (this.readyState == 4 && this.status == 200) {
                var responseObj = JSON.parse(this.responseText);
                //console.log('Got back this.responseText: ' + this.responseText);
                sse.rmSSEOSRefreshWriteONCAA(responseObj);
                //console.log('just called rmSSEOSRefreshWriteONCAA ');
            }
        };
        //logger('Done setting up XMLHttpRequest',llDebug);
        xhttp.open("POST", apiEndpoint, true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(bodyDataStr);
    }
    // objReadWithChildrenAndAncestorsCB
    // Fetch a single Object from the API, place it in the Object Store and 
    // mark it as "fresh"
    //rmAPIFetchSingleObject(ctrlObj,dataObj) {
    rmAPIFetchSingleObjectWithChildrenAndAncestorsCB(renderCallback,objIdIn) {
        var methNm = 'rmAPIFetchSingleObjectWithChildrenAndAncestorsCB - ';
        this.logger(methNm + 'BEGIN!');
        var llError = 2;
        var llWarn = 3;
        var llDebug = 4;
        var llInfo = 5;
        
        var sessStat = this.su.sTOCheck();
        if (sessStat < 0) {
            throw "Session expired.";
        }
        
        
        // THIS WILL PROBABLY REQUIRE SOME REWORK -- Rather than making all 
        // the calling entities build special data objects and control 
        // objects, we can just pull in those values from SessionStore
        var sCfg = this.sse.ssRead('localcfg');
        
        const apiEndpoint = sCfg.apibaseuri + sCfg.apiepsofwca + '/' + objIdIn;
        this.logger(methNm + 'apiEndpoint: ' + apiEndpoint);

        var tmpSession = this.sse.rmSSEFetchSession();
        var dataObj = {};
        if (tmpSession.hasOwnProperty('token')) {
            dataObj.sid = tmpSession.token;
        } else if (tmpSession.hasOwnProperty('stoken')){
            dataObj.sid = tmpSession.stoken;
        } else if (tmpSession.hasOwnProperty('sid')){
            dataObj.sid = tmpSession.sid;
        }
        if (tmpSession.hasOwnProperty('tid')) {
            dataObj.tid = tmpSession.tid;
        } else if (tmpSession.hasOwnProperty('treeid')) {
            dataObj.tid = tmpSession.treeid;
        }
        dataObj.oid = objIdIn;
        //dataObj['toid'] = objIdIn;
        
        //logger(methNm + 'BEGIN',llDebug);
        const bodyDataStr = JSON.stringify(dataObj);
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            var methNm = 'readystatechange';
            var sse = new RMSSSEnhanced();
            var lut = new RMLogUtil('RMAPI.rmAPIFetchSingleObjectWithChildrenAndAncestorsCB.xhttp',3);
            if (this.readyState == 4 && this.status == 200) {
                var responseObj = JSON.parse(this.responseText);
                //console.log('Got back this.responseText: ' + this.responseText);
                //sse.rmSSEOSRefreshWriteONCAA(responseObj); // <<===  AAAAIIIGHHH!!!  NNNOOOOOOO!!!!!  NO REFRESH!
                sse.rmSSEOSNoRefreshWriteONCAA(responseObj); // <<===  AAAAIIIGHHH!!!  NNNOOOOOOO!!!!!  NO REFRESH!
                //rmSSEOSNoRefreshWriteONCAA
                //console.log('just called rmSSEOSRefreshWriteONCAA ');
                lut.log(methNm,'calling callback!',6);
                renderCallback();
            }
        };
        //logger('Done setting up XMLHttpRequest',llDebug);
        xhttp.open("POST", apiEndpoint, true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(bodyDataStr);
    }
    // rmAPICreateChildObject
    // Create a child object to the current target object
    rmAPICreateChildObject(objIdIn,afterIdIn) {   //        // <<<=== TICKET 22f22fd5da9661dc6a8d8157dff93493e27980b9
        // THIS SHOULD PROBABLY HAVE A WAY TO DIFFERENTIATE BETWEEN
        // PLAIN OLD ADD, AND ADD-AFTER, rather than making a whole new method.
        
        //throw "STOP CALLING ME";
        
        var methNm = 'rmAPICreateChildObject - ';
        this.logger(methNm + 'BEGIN',2);
        // OK, I'm pretty sure this is viable.  Went through it and I think 
        // the variables all line up, and all the requirements are satisfied.  
        // I think this is OK for a first pass.
        // Mind you, that does NOT mean this should not be cleaned up.  
        // Where it seemed to make sense to do so, I have left older versions 
        // of lines in place, but commented for context in troubleshooting.
        
        // THIS WILL PROBABLY REQUIRE SOME REWORK -- Rather than making all 
        // the calling entities build special data objects and control 
        // objects, we can just pull in those values from SessionStore
        var sCfg = this.sse.ssRead('localcfg');
        //const apiEndpoint = sCfg.apibaseuri + sCfg.apiepsou;
    
        // THE RIGHT WAY TO GET SESSION DATA FOR THIS ENVIRONMENT
        var sessObj = this.sse.rmSSEFetchSession();
        
        //logger(methNm + 'localData: ' + JSON.stringify(localData),llDebug);
        var sesData = sessObj;
        var dataObj = {};
    
        //var contData = localData;
        var sesKeyList = ['oid','tid','sid'];

        var txData = {};
        
        //  API IS REPORTING NO SID... ?!?!?!?!
        for (var kIdx in sesKeyList) {
            var vKey = sesKeyList[kIdx];
            if(sesData.hasOwnProperty(vKey)) {
                txData[vKey] = sesData[vKey];
            } else {
                console.log('POOOOOOP!  Looks like session is missing key ' + vKey);
            }
        }

        
        const apiEndpoint = sCfg.apibaseuri + sCfg.apiepsonew + '/' + objIdIn;
        this.logger(methNm + "ENDPOINT: " + apiEndpoint,2);
        
        txData['oid'] = objIdIn;
        txData['data'] = {};
        
        //  undersn  <<=== key in transmitted JSON for the ID of the object this new object should appear after
        
        //var tmpEndpoint = '../api/obj/update/' + objIdIn;
        //const bodyDataStr = JSON.stringify(txData);

        // BEGIN TICKET 22f22fd5da9661dc6a8d8157dff93493e27980b9 20200207
        // so, it looks like afterIdIn in the parameter list is expected to be the DOM
        // Element ID in the Child Object List under which this new child should be
        // sequenced.
        // TYPICALLY something like this: 
        //    switchboard('childaddafter','a9c15140a3ca91d49d055ea5a7e1f3e4ec7f0610c070d55e780ddc0ac94b34c4-addbelow',{})
        
        var elderSibId = '';
        var elderSibSeqNmbr = 0;
        var elderSibObj = {};
        var elderSibDomElIdParts = [];
        try {
            elderSibDomElIdParts = afterIdIn.split('-');
            elderSibId = elderSibDomElIdParts[0];
            elderSibObj = this.sse.rmSSEOSRead(elderSibId);
            elderSibSeqNmbr = elderSibObj['seqnmbr'];
            txData['data']['undersn'] = parseInt(elderSibSeqNmbr);
            
        } catch (e) {
            this.loggerEnh(methNm,'EXCEPTION: Tried splitting afterIdIn - failed: ' + JSON.stringify(e),2);
        }
        // END TICKET 22f22fd5da9661dc6a8d8157dff93493e27980b9 20200207



        this.logger(methNm + "SETTING UP THE THROBBER!!!!",2);
        // Decide whether this new object is supposed to go at the end, or after the current object
        var dDivId = '';
        if ( afterIdIn == undefined) {
            // It's going at the end
            dDivId = 'rmpc-child-append-qaf';
        } else {
            // it's going after the current object
            // figure out the id of the child after the one specificed in afterIdIn
            // addChildAfter('6532443807a309cdd2232fed2bd2ad368860c8d545ba61176621246b81541eb3-addbelow')
            var idElList = afterIdIn.split('-');
            var elderSibObjId = idElList[0];
            var elderSibObj = this.sse.ssOKRead('treeos',elderSibObjId);
            if (elderSibObj.hasOwnProperty('seqnmbr')) {
                dDivId = afterIdIn;
                //var esSeqNmbr = elderSibObj['seqnmbr'];
                //  There should be some kind of check here to 
                // make sure we're not walking on the REAL next 
                // item.  This will do for now.
                //responseObj['seqnmbr'] = esSeqNmbr + 1;
                
            } else {
                dDivId = 'rmpc-child-append-qaf';
            }
        }
        
        try {
            document.getElementById(dDivId).innerHTML = '<div class="loader" id="new-child-load-throbber"><br><br>LOADING....</div>';  // <div class="loader" id="col-load-throbber">LOADING....</div>
        } catch (e) {
            console.log('POOP!  Can\'t throb!');
        }
        this.logger(methNm + "DONE SETTING UP THE THROBBER!!!!",2);
        
        logger(methNm + 'BEGIN',5);
        //const bodyDataStr = JSON.stringify(dataObj);
        const bodyDataStr = JSON.stringify(txData);
        this.logger(methNm + 'bodyDataStr: ' + bodyDataStr,2);
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log('NEW CHILD CONTENT: ' + this.responseText);
                var responseObj = JSON.parse(this.responseText);
                // THIS SHOULD BE AN SSE WRITE.
                //svcAddChildFormDisplay(responseObj,dataObj,targDivId);
                var objId = responseObj['id'];
                console.log('NEW CHILD ID: ' + objId);
                var sse = new RMSSSEnhanced();
                
                // Get the ObjId of the "parent"
                var parentObjId = sse.rmSSEFetchSession().oid;
                
                //sse.ssOKWrite('treeos',objId,responseObj);
                console.log('NEW CHILD CONFIRM WRITE TO LOCAL STORE: ' + JSON.stringify(sse.ssOKRead('treeos',objId)));
                //this.ssOKWrite('treeos',oId,objObjIn);
                var col  = new RMPCChildObjectList();
                var qafHtml = '';
                //var dDivId = '';
                var dEl = '';
                //qafHtml = col.renderNewChildQAF(responseObj);
                
                // Decide whether this new object is supposed to go at the end, or after the current object
                if ( afterIdIn == undefined) {
                    // It's going at the end
                    dDivId = 'rmpc-child-append-qaf';
                } else {
                    // it's going after the current object
                    // figure out the id of the child after the one specificed in afterIdIn
                    // addChildAfter('6532443807a309cdd2232fed2bd2ad368860c8d545ba61176621246b81541eb3-addbelow')
                    var idElList = afterIdIn.split('-');
                    var elderSibObjId = idElList[0];
                    var elderSibObj = sse.ssOKRead('treeos',elderSibObjId);
                    if (elderSibObj.hasOwnProperty('seqnmbr')) {
                        dDivId = afterIdIn;
                        var esSeqNmbr = elderSibObj['seqnmbr'];
                        //  There should be some kind of check here to 
                        // make sure we're not walking on the REAL next 
                        // item.  This will do for now.
                        responseObj['seqnmbr'] = esSeqNmbr + 1;
                        
                    } else {
                        dDivId = 'rmpc-child-append-qaf';
                    }
                }
                
                sse.ssOKWrite('treeos',objId,responseObj);
                qafHtml = col.renderNewChildQAF(responseObj,afterIdIn); // <<<=====  Should probably have some contitional handling

                
                // Now that we've written the new object to storage, 
                // let's make sure this new object is in the local 
                // tree as a child of its parent
                var tu = new RMTreeUtil();
                var objAddResult = tu.metaAddChildToParent(parentObjId,objId);  // <<=== FIGURE OUT parentIdIn
                

                try {
                    dEl = document.getElementById(dDivId);  
                    dEl.style.display = 'none';
                    dEl.innerHTML = qafHtml;
                    dEl.style.display = 'block';
    
                    if (dDivId == 'rmpc-child-append-qaf') {
                        // Force scroll to bottom
                        var oeid = 'rmpc-wspace-right-container';
                        var div = document.getElementById(oeid);
                        div.scrollTop = div.scrollHeight - div.clientHeight;
    
                        var focusQaf = document.getElementById('rmpc-child-append-qaf');
                        var focusInner01 = focusQaf.firstChild;
                        var focusOcvId = focusInner01.id;
                        var focusCoId = focusOcvId.replace('-ocv','');
                        var focusEditDivId = focusCoId + '-ocv-edit';
                        var focusEdDivEl = document.getElementById(focusEditDivId);
                        var focusTargEl = focusEdDivEl.children[2].children[0].children[0].children[1];
                        focusTargEl.focus();
                    }
                } catch (e) {
                    console.log('EXCEPTOIN: Failed to focus on the rmpc-child-append-qaf: ' + JSON.stringify(e) );
                }
                // Focus obj: ff-81d0118e760e3ba003eec73ce3abbe5f6f72c0879470bc3a3f01b93c193e4ede-type-@
                // setFocus(focusFieldId);
                // Maybe set focus to first field by walking the tree.
                
                // SET FOCUS TARGET:
                //var focusQaf = document.getElementById('rmpc-child-append-qaf');
                //var focusInner01 = focusQaf.firstChild;
                //var focusOcvId = focusInner01.id;
                //var focusCoId = focusOcvId.replace('-ocv','');
                //var focusEditDivId = focusCoId + '-ocv-edit';
                //var focusEdDivEl = document.getElementById(focusEditDivId);
                //var focusTargEl = focusEdDivEl.children[2].children[0].children[0].children[1];
                //focusTargEl.focus();
                //var focusFirstFieldId = focusEdDivEl.children[2].children[0].children[0].children[1].id;
                //console.log('WHOODEEDOO: ' + firstFieldId);
                //setFocus(focusFirstFieldId);
                //focus(focusFirstFieldId);
                
                // QAF Div ID:  "rmpc-child-append-qaf"
                // DEF. SEEMS LIKE WE'RE MISSING SOMETHING HERE
            }
        };
        //logger('Done setting up XMLHttpRequest');
        xhttp.open("POST", apiEndpoint, true); //apiEndpoint
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(bodyDataStr);






        //txData['oid'] = objIdIn;
        //txData['data'] = contData;
    
        //var tmpEndpoint = '../api/obj/update/' + objIdIn;
        //const bodyDataStr = JSON.stringify(txData);
        ////logger(methNm + 'bodyDataStr: ' + bodyDataStr,llDebug);
        //this.logger(methNm + 'Prepping XMLHttpRequest');
        
        //var xhttp = new XMLHttpRequest();
        //xhttp.onreadystatechange = function() {
            //if (this.readyState == 4 && this.status == 200) {
                //var sse = new RMSSSEnhanced();
                //var resObj = JSON.parse(this.responseText);
                //if (resObj['status'] == 'ok') {
                    //sse.rmSSEObjMarkNotDirty(objIdIn);
                    //console.log('Object ' + objIdIn + ' SHOULD BE MARKED NOT DIRTY NOW!');
                //} else {
                    //console.log('GAH!  UPDATE PUKED! ' + this.responseText);
                    ////THIS SHOULD PROBABLY NOT BE HERE FOR PRODUCTION... NEED TO STOP RUNAWAY UPDATED THO
                    //sse.rmSSEObjMarkNotDirty(objIdIn);
                //}
                ////logger(methNm + "got back: " + this.responseText,llDebug);
            //}
        //};
        ////logger(methNm + 'Done setting up XMLHttpRequest',llInfo);
        //xhttp.open("POST", tmpEndpoint, true); //tmpEndpoint
        //xhttp.setRequestHeader("Content-type", "application/json");
        ////this.logger(methNm + 'Calling XMLHttpRequest');
        //console.log('SENDING UPDATE: ' + bodyDataStr);
        //xhttp.send(bodyDataStr);
        ////this.logger(methNm + 'Called XMLHttpRequest');

        
    }

    rmAPICreateChildObjectQuick(objIdIn,afterIdIn) {   //  <<<======  TICKET  657e6086490032275217ad16485794251b80201b
        // THIS SHOULD PROBABLY HAVE A WAY TO DIFFERENTIATE BETWEEN
        // PLAIN OLD ADD, AND ADD-AFTER, rather than making a whole new method.
        
        
        var methNm = 'rmAPICreateChildObjectQuick - ';
        this.logger(methNm + 'BEGIN',2);
        // OK, I'm pretty sure this is viable.  Went through it and I think 
        // the variables all line up, and all the requirements are satisfied.  
        // I think this is OK for a first pass.
        // Mind you, that does NOT mean this should not be cleaned up.  
        // Where it seemed to make sense to do so, I have left older versions 
        // of lines in place, but commented for context in troubleshooting.
        
        // THIS WILL PROBABLY REQUIRE SOME REWORK -- Rather than making all 
        // the calling entities build special data objects and control 
        // objects, we can just pull in those values from SessionStore
        var sCfg = this.sse.ssRead('localcfg');
        //const apiEndpoint = sCfg.apibaseuri + sCfg.apiepsou;
    
        // THE RIGHT WAY TO GET SESSION DATA FOR THIS ENVIRONMENT
        var sessObj = this.sse.rmSSEFetchSession();
        
        //logger(methNm + 'localData: ' + JSON.stringify(localData),llDebug);
        var sesData = sessObj;
        var dataObj = {};
    
        //var contData = localData;
        var sesKeyList = ['oid','tid','sid'];

        var txData = {};
        
        //  API IS REPORTING NO SID... ?!?!?!?!
        for (var kIdx in sesKeyList) {
            var vKey = sesKeyList[kIdx];
            if(sesData.hasOwnProperty(vKey)) {
                txData[vKey] = sesData[vKey];
            } else {
                this.loggerEnh(methNM + 'POOOOOOP!  Looks like session is missing key ' + vKey,2);
            }
        }
        
        // SLOW WAY THAT WORKS
        //const apiEndpoint = sCfg.apibaseuri + sCfg.apiepsonew + '/' + objIdIn;
        // FAST WAY THAT HASNT BEEN TESTED
        const apiEndpoint = sCfg.apibaseuri + sCfg.apiepsonewquick + '/' + objIdIn;
        
        this.loggerEnh(methNm,"ENDPOINT: " + apiEndpoint,2);
        
        txData['oid'] = objIdIn;
        txData['data'] = {};
        
        //var tmpEndpoint = '../api/obj/update/' + objIdIn;
        //const bodyDataStr = JSON.stringify(txData);

        this.loggerEnh(methNm,"SETTING UP THE THROBBER!!!!",2);
        // Decide whether this new object is supposed to go at the end, or after the current object
        var dDivId = '';
        if ( afterIdIn == undefined) {
            // It's going at the end
            dDivId = 'rmpc-child-append-qaf';
        } else {
            this.loggerEnh(methNm,'afterIdIn: ' + afterIdIn,2);
            // it's going after the current object
            // figure out the id of the child after the one specificed in afterIdIn
            // addChildAfter('6532443807a309cdd2232fed2bd2ad368860c8d545ba61176621246b81541eb3-addbelow')
            var idElList = afterIdIn.split('-');
            var elderSibObjId = idElList[0];
            var elderSibObj = this.sse.ssOKRead('treeos',elderSibObjId);
            if (elderSibObj.hasOwnProperty('seqnmbr')) {
                dDivId = afterIdIn;
                //var esSeqNmbr = elderSibObj['seqnmbr'];
                //  There should be some kind of check here to 
                // make sure we're not walking on the REAL next 
                // item.  This will do for now.
                //responseObj['seqnmbr'] = esSeqNmbr + 1;
                
            } else {
                dDivId = 'rmpc-child-append-qaf';
            }
        }
        
        document.getElementById(dDivId).innerHTML = '<div class="loader" id="new-child-load-throbber"><br><br>LOADING....</div>';  // <div class="loader" id="col-load-throbber">LOADING....</div>
        this.loggerEnh(methNm,"DONE SETTING UP THE THROBBER!!!!",2);
        
        //logger(methNm + 'BEGIN',5);
        //const bodyDataStr = JSON.stringify(dataObj);
        const bodyDataStr = JSON.stringify(txData);
        this.loggerEnh(methNm,'bodyDataStr: ' + bodyDataStr,2);
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log('NEW CHILD CONTENT: ' + this.responseText);
                var responseObj = JSON.parse(this.responseText);
                // THIS SHOULD BE AN SSE WRITE.
                //svcAddChildFormDisplay(responseObj,dataObj,targDivId);
                var objId = responseObj['id'];
                console.log('NEW CHILD ID: ' + objId);
                var sse = new RMSSSEnhanced();
                
                // Get the ObjId of the "parent"
                var parentObjId = sse.rmSSEFetchSession().oid;
                
                //sse.ssOKWrite('treeos',objId,responseObj);
                console.log('NEW CHILD CONFIRM WRITE TO LOCAL STORE: ' + JSON.stringify(sse.ssOKRead('treeos',objId)));
                //this.ssOKWrite('treeos',oId,objObjIn);
                var col  = new RMPCChildObjectList();
                var qafHtml = '';
                //var dDivId = '';
                var dEl = '';
                //qafHtml = col.renderNewChildQAF(responseObj);
                
                // Decide whether this new object is supposed to go at the end, or after the current object
                if ( afterIdIn == undefined) {
                    // It's going at the end
                    dDivId = 'rmpc-child-append-qaf';
                } else {
                    // it's going after the current object
                    // figure out the id of the child after the one specificed in afterIdIn
                    // addChildAfter('6532443807a309cdd2232fed2bd2ad368860c8d545ba61176621246b81541eb3-addbelow')
                    var idElList = afterIdIn.split('-');
                    var elderSibObjId = idElList[0];
                    var elderSibObj = sse.ssOKRead('treeos',elderSibObjId);
                    if (elderSibObj.hasOwnProperty('seqnmbr')) {
                        dDivId = afterIdIn;
                        var esSeqNmbr = elderSibObj['seqnmbr'];
                        //  There should be some kind of check here to 
                        // make sure we're not walking on the REAL next 
                        // item.  This will do for now.
                        responseObj['seqnmbr'] = esSeqNmbr + 1;
                        
                    } else {
                        dDivId = 'rmpc-child-append-qaf';
                    }
                }
                
                sse.ssOKWrite('treeos',objId,responseObj);
                qafHtml = col.renderNewChildQAF(responseObj,afterIdIn); // <<<=====  Should probably have some contitional handling

                
                // Now that we've written the new object to storage, 
                // let's make sure this new object is in the local 
                // tree as a child of its parent
                var tu = new RMTreeUtil();
                var objAddResult = tu.metaAddChildToParent(parentObjId,objId);  // <<=== FIGURE OUT parentIdIn
                

                
                dEl = document.getElementById(dDivId);  
                dEl.style.display = 'none';
                dEl.innerHTML = qafHtml;
                dEl.style.display = 'block';

                if (dDivId == 'rmpc-child-append-qaf') {
                    // Force scroll to bottom
                    var oeid = 'rmpc-wspace-right-container';
                    var div = document.getElementById(oeid);
                    div.scrollTop = div.scrollHeight - div.clientHeight;

                    var focusQaf = document.getElementById('rmpc-child-append-qaf');
                    var focusInner01 = focusQaf.firstChild;
                    var focusOcvId = focusInner01.id;
                    var focusCoId = focusOcvId.replace('-ocv','');
                    var focusEditDivId = focusCoId + '-ocv-edit';
                    var focusEdDivEl = document.getElementById(focusEditDivId);
                    var focusTargEl = focusEdDivEl.children[2].children[0].children[0].children[1];
                    focusTargEl.focus();
                }
                // Focus obj: ff-81d0118e760e3ba003eec73ce3abbe5f6f72c0879470bc3a3f01b93c193e4ede-type-@
                // setFocus(focusFieldId);
                // Maybe set focus to first field by walking the tree.
                
                // SET FOCUS TARGET:
                //var focusQaf = document.getElementById('rmpc-child-append-qaf');
                //var focusInner01 = focusQaf.firstChild;
                //var focusOcvId = focusInner01.id;
                //var focusCoId = focusOcvId.replace('-ocv','');
                //var focusEditDivId = focusCoId + '-ocv-edit';
                //var focusEdDivEl = document.getElementById(focusEditDivId);
                //var focusTargEl = focusEdDivEl.children[2].children[0].children[0].children[1];
                //focusTargEl.focus();
                //var focusFirstFieldId = focusEdDivEl.children[2].children[0].children[0].children[1].id;
                //console.log('WHOODEEDOO: ' + firstFieldId);
                //setFocus(focusFirstFieldId);
                //focus(focusFirstFieldId);
                
                // QAF Div ID:  "rmpc-child-append-qaf"
                // DEF. SEEMS LIKE WE'RE MISSING SOMETHING HERE
            }
        };
        //logger('Done setting up XMLHttpRequest');
        xhttp.open("POST", apiEndpoint, true); //apiEndpoint
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(bodyDataStr);






        //txData['oid'] = objIdIn;
        //txData['data'] = contData;
    
        //var tmpEndpoint = '../api/obj/update/' + objIdIn;
        //const bodyDataStr = JSON.stringify(txData);
        ////logger(methNm + 'bodyDataStr: ' + bodyDataStr,llDebug);
        //this.logger(methNm + 'Prepping XMLHttpRequest');
        
        //var xhttp = new XMLHttpRequest();
        //xhttp.onreadystatechange = function() {
            //if (this.readyState == 4 && this.status == 200) {
                //var sse = new RMSSSEnhanced();
                //var resObj = JSON.parse(this.responseText);
                //if (resObj['status'] == 'ok') {
                    //sse.rmSSEObjMarkNotDirty(objIdIn);
                    //console.log('Object ' + objIdIn + ' SHOULD BE MARKED NOT DIRTY NOW!');
                //} else {
                    //console.log('GAH!  UPDATE PUKED! ' + this.responseText);
                    ////THIS SHOULD PROBABLY NOT BE HERE FOR PRODUCTION... NEED TO STOP RUNAWAY UPDATED THO
                    //sse.rmSSEObjMarkNotDirty(objIdIn);
                //}
                ////logger(methNm + "got back: " + this.responseText,llDebug);
            //}
        //};
        ////logger(methNm + 'Done setting up XMLHttpRequest',llInfo);
        //xhttp.open("POST", tmpEndpoint, true); //tmpEndpoint
        //xhttp.setRequestHeader("Content-type", "application/json");
        ////this.logger(methNm + 'Calling XMLHttpRequest');
        //console.log('SENDING UPDATE: ' + bodyDataStr);
        //xhttp.send(bodyDataStr);
        ////this.logger(methNm + 'Called XMLHttpRequest');

        
    }

    rmAPICreateChildObjectWithContent(objIdIn,afterIdIn,contentObjIn) {   //  <<<======  TICKET  657e6086490032275217ad16485794251b80201b
        var methNm = 'rmAPICreateChildObject - ';
        this.logger(methNm + 'BEGIN',2);
        // OK, I'm pretty sure this is viable.  Went through it and I think 
        // the variables all line up, and all the requirements are satisfied.  
        // I think this is OK for a first pass.
        // Mind you, that does NOT mean this should not be cleaned up.  
        // Where it seemed to make sense to do so, I have left older versions 
        // of lines in place, but commented for context in troubleshooting.
        
        // THIS WILL PROBABLY REQUIRE SOME REWORK -- Rather than making all 
        // the calling entities build special data objects and control 
        // objects, we can just pull in those values from SessionStore
        var sCfg = this.sse.ssRead('localcfg');
        //const apiEndpoint = sCfg.apibaseuri + sCfg.apiepsou;
    
        // THE RIGHT WAY TO GET SESSION DATA FOR THIS ENVIRONMENT
        var sessObj = this.sse.rmSSEFetchSession();
        
        //logger(methNm + 'localData: ' + JSON.stringify(localData),llDebug);
        var sesData = sessObj;
        var dataObj = {};
    
        //var contData = localData;
        var sesKeyList = ['oid','tid','sid'];

        var txData = {};
        
        //  API IS REPORTING NO SID... ?!?!?!?!
        for (var kIdx in sesKeyList) {
            var vKey = sesKeyList[kIdx];
            if(sesData.hasOwnProperty(vKey)) {
                txData[vKey] = sesData[vKey];
            } else {
                console.log('POOOOOOP!  Looks like session is missing key ' + vKey);
            }
        }
        
        const apiEndpoint = sCfg.apibaseuri + sCfg.apiepsonew + '/' + objIdIn;
        this.logger(methNm + "ENDPOINT: " + apiEndpoint,2);
        
        txData['oid'] = objIdIn;
        //txData['data'] = {};
        txData['data'] = contentObjIn;
        
        //var tmpEndpoint = '../api/obj/update/' + objIdIn;
        //const bodyDataStr = JSON.stringify(txData);

        this.logger(methNm + "SETTING UP THE THROBBER!!!!",2);
        // Decide whether this new object is supposed to go at the end, or after the current object
        var dDivId = '';
        if ( afterIdIn == undefined) {
            // It's going at the end
            dDivId = 'rmpc-child-append-qaf';
        } else {
            // it's going after the current object
            // figure out the id of the child after the one specificed in afterIdIn
            // addChildAfter('6532443807a309cdd2232fed2bd2ad368860c8d545ba61176621246b81541eb3-addbelow')
            var idElList = afterIdIn.split('-');
            var elderSibObjId = idElList[0];
            var elderSibObj = this.sse.ssOKRead('treeos',elderSibObjId);
            if (elderSibObj.hasOwnProperty('seqnmbr')) {
                dDivId = afterIdIn;
                //var esSeqNmbr = elderSibObj['seqnmbr'];
                //  There should be some kind of check here to 
                // make sure we're not walking on the REAL next 
                // item.  This will do for now.
                //responseObj['seqnmbr'] = esSeqNmbr + 1;
                
            } else {
                dDivId = 'rmpc-child-append-qaf';
            }
        }
        
        document.getElementById(dDivId).innerHTML = '<div class="loader" id="new-child-load-throbber"><br><br>LOADING....</div>';  // <div class="loader" id="col-load-throbber">LOADING....</div>
        this.logger(methNm + "DONE SETTING UP THE THROBBER!!!!",2);
        
        logger(methNm + 'BEGIN',5);
        //const bodyDataStr = JSON.stringify(dataObj);
        const bodyDataStr = JSON.stringify(txData);
        this.logger(methNm + 'bodyDataStr: ' + bodyDataStr,2);
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log('NEW CHILD CONTENT: ' + this.responseText);
                var responseObj = JSON.parse(this.responseText);
                // THIS SHOULD BE AN SSE WRITE.
                //svcAddChildFormDisplay(responseObj,dataObj,targDivId);
                var objId = responseObj['id'];
                console.log('NEW CHILD ID: ' + objId);
                
                
                //  BEGIN -- THE REST OF THIS IS SUPERFLUOUS
                //  BEGIN -- THE REST OF THIS IS SUPERFLUOUS
                //  BEGIN -- THE REST OF THIS IS SUPERFLUOUS
                //  BEGIN -- THE REST OF THIS IS SUPERFLUOUS
                //var sse = new RMSSSEnhanced();
                
                //// Get the ObjId of the "parent"
                //var parentObjId = sse.rmSSEFetchSession().oid;
                
                ////sse.ssOKWrite('treeos',objId,responseObj);
                //console.log('NEW CHILD CONFIRM WRITE TO LOCAL STORE: ' + JSON.stringify(sse.ssOKRead('treeos',objId)));
                ////this.ssOKWrite('treeos',oId,objObjIn);
                //var col  = new RMPCChildObjectList();
                //var qafHtml = '';
                ////var dDivId = '';
                //var dEl = '';
                ////qafHtml = col.renderNewChildQAF(responseObj);
                
                //// Decide whether this new object is supposed to go at the end, or after the current object
                //if ( afterIdIn == undefined) {
                    //// It's going at the end
                    //dDivId = 'rmpc-child-append-qaf';
                //} else {
                    //// it's going after the current object
                    //// figure out the id of the child after the one specificed in afterIdIn
                    //// addChildAfter('6532443807a309cdd2232fed2bd2ad368860c8d545ba61176621246b81541eb3-addbelow')
                    //var idElList = afterIdIn.split('-');
                    //var elderSibObjId = idElList[0];
                    //var elderSibObj = sse.ssOKRead('treeos',elderSibObjId);
                    //if (elderSibObj.hasOwnProperty('seqnmbr')) {
                        //dDivId = afterIdIn;
                        //var esSeqNmbr = elderSibObj['seqnmbr'];
                        ////  There should be some kind of check here to 
                        //// make sure we're not walking on the REAL next 
                        //// item.  This will do for now.
                        //responseObj['seqnmbr'] = esSeqNmbr + 1;
                        
                    //} else {
                        //dDivId = 'rmpc-child-append-qaf';
                    //}
                //}
                
                //sse.ssOKWrite('treeos',objId,responseObj);
                //qafHtml = col.renderNewChildQAF(responseObj,afterIdIn); // <<<=====  Should probably have some contitional handling

                
                //// Now that we've written the new object to storage, 
                //// let's make sure this new object is in the local 
                //// tree as a child of its parent
                //var tu = new RMTreeUtil();
                //var objAddResult = tu.metaAddChildToParent(parentObjId,objId);  // <<=== FIGURE OUT parentIdIn
                

                
                //dEl = document.getElementById(dDivId);  
                //dEl.style.display = 'none';
                //dEl.innerHTML = qafHtml;
                //dEl.style.display = 'block';

                //if (dDivId == 'rmpc-child-append-qaf') {
                    //// Force scroll to bottom
                    //var oeid = 'rmpc-wspace-right-container';
                    //var div = document.getElementById(oeid);
                    //div.scrollTop = div.scrollHeight - div.clientHeight;

                    //var focusQaf = document.getElementById('rmpc-child-append-qaf');
                    //var focusInner01 = focusQaf.firstChild;
                    //var focusOcvId = focusInner01.id;
                    //var focusCoId = focusOcvId.replace('-ocv','');
                    //var focusEditDivId = focusCoId + '-ocv-edit';
                    //var focusEdDivEl = document.getElementById(focusEditDivId);
                    //var focusTargEl = focusEdDivEl.children[2].children[0].children[0].children[1];
                    //focusTargEl.focus();
                //}
                //  END -- THE REST OF THIS IS SUPERFLUOUS
                //  END -- THE REST OF THIS IS SUPERFLUOUS
                //  END -- THE REST OF THIS IS SUPERFLUOUS
                //  END -- THE REST OF THIS IS SUPERFLUOUS
           }
        };
        //logger('Done setting up XMLHttpRequest');
        xhttp.open("POST", apiEndpoint, true); //apiEndpoint
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(bodyDataStr);
    }

    // rmAPIDeleteChildObject
    // Perform a recursive delete of the selected child object and all 
    // descendants of that object
    rmAPIDeleteChildObject(objIdIn,cbf){
        var methNm = 'rmAPIDeleteChildObject - ';
        this.loggerEnh(methNm,'BEGIN',2);
        
        var sCfg = this.sse.ssRead('localcfg');
        //const apiEndpoint = sCfg.apibaseuri + sCfg.apiepsou;
    
        // THE RIGHT WAY TO GET SESSION DATA FOR THIS ENVIRONMENT
        var sessObj = this.sse.rmSSEFetchSession();
        
        //logger(methNm + 'localData: ' + JSON.stringify(localData),llDebug);
        var sesData = sessObj;
        var dataObj = {};
        
        //const apiEndpoint = sCfg.apibaseuri + sCfg.apiepsodelor + '/' + objIdIn; 
        //this.logger(methNm + "ENDPOINT: " + apiEndpoint,2);
        
        var txData = {};
        txData['oid'] = objIdIn;
        txData['sid'] = sesData['sid'];
        txData['tid'] = sesData['tid'];
        //dataObj.sid = tmpSession.sid;
        txData['data'] = {};
        
        
        logger(methNm + 'BEGIN',5);
        //const bodyDataStr = JSON.stringify(dataObj);
        const bodyDataStr = JSON.stringify(txData);
        this.logger(methNm + 'bodyDataStr: ' + bodyDataStr,2);
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log('NEW CHILD CONTENT: ' + this.responseText);
                var responseObj = JSON.parse(this.responseText);
                // This should do the local recursive delete
                cbf(objIdIn);
            }
        };
        //const apiEndpoint = 'http://127.0.0.1/api/obj/delete/' + objIdIn;
        const apiEndpoint = '/api/obj/delete/' + objIdIn;
        // http://127.0.0.1/api/delete/434be232ae4512ba05cfcbfe75680892d21c41b67055d5f94dc12719972a70db
        xhttp.open("POST", apiEndpoint, true); //apiEndpoint
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(bodyDataStr);


        
        
    }
    // Post an Object Update to the API from the Object Store and mark it as 
    // "not dirty"
    rmAPIPostSingleObject(objIdIn) {
        var methNm = 'rmAPIPostSingleObject - ';
        var llDebug = 2;
        
        //1f90cf8f1963d3c6286a5827c21c267f5e0b0b02bd73e3f7d51cd63dbf4021a5-cltbl-col1
        
        
        var indicatorDEl = false;
        try {
            var tmpIndDEl = document.getElementById(objIdIn + '-cltbl-col1');
            var junk = tmpIndDEl.id;
            indicatorDEl = tmpIndDEl;
        } catch (e) {
            this.loggerEnh(methNm,'Looks like we\'re not dealing with a Child Object')
            // 581a8008b8beebe5064010e047f9261a04c52f1579fac280bbdf33475e83832d-ocv
            try {
                var tmpIndDEl = document.getElementById(objIdIn + '-ocv');
                var junk = tmpIndDEl.id;
                indicatorDEl = tmpIndDEl;
            } catch (e) {
                this.loggerEnh(methNm,'Looks like we\'re not dealing with a stand-along object. ')
            }
        }
        if (indicatorDEl) {
            indicatorDEl.style.backgroundColor = '#ff8888';
        }

        
        
        
        // OK, I'm pretty sure this is viable.  Went through it and I think 
        // the variables all line up, and all the requirements are satisfied.  
        // I think this is OK for a first pass.
        // Mind you, that does NOT mean this should not be cleaned up.  
        // Where it seemed to make sense to do so, I have left older versions 
        // of lines in place, but commented for context in troubleshooting.
        
        // THIS WILL PROBABLY REQUIRE SOME REWORK -- Rather than making all 
        // the calling entities build special data objects and control 
        // objects, we can just pull in those values from SessionStore
        var sCfg = this.sse.ssRead('localcfg');
        const apiEndpoint = sCfg.apibaseuri + sCfg.apiepsou;
    
        // THE RIGHT WAY TO GET SESSION DATA FOR THIS ENVIRONMENT
        var sessObj = this.sse.rmSSEFetchSession();
        var contentObj = this.sse.rmSSEOSRead(objIdIn);
        
        if (contentObj.hasOwnProperty('svcextras')) {
            delete contentObj['svcextras'];
            //this.logger(methNm + 'Deleted svcextras from update data',2);
        }
            
    
        var localData = contentObj;
        //logger(methNm + 'localData: ' + JSON.stringify(localData),llDebug);
        var sesData = sessObj;
    
        var contData = localData;
        var sesKeyList = ['oid','tid','sid'];

        var txData = {};
        
        //  API IS REPORTING NO SID... ?!?!?!?!
        for (var kIdx in sesKeyList) {
            var vKey = sesKeyList[kIdx];
            if(sesData.hasOwnProperty(vKey)) {
                txData[vKey] = sesData[vKey];
            } else {
                this.loggerEnh(methNm,'POOOOOOP!  Looks like session is missing key ' + vKey,2);
            }
        }
        
        txData['oid'] = objIdIn;
        txData['data'] = contData;
    
        var tmpEndpoint = '../api/obj/update/' + objIdIn;
        const bodyDataStr = JSON.stringify(txData);
        this.loggerEnh(methNm,'bodyDataStr: ' + bodyDataStr,llDebug);
        //this.logger(methNm + 'Prepping XMLHttpRequest',2);
        
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            var methNm = 'onreadystatechange'
            if (this.readyState == 4 && this.status == 200) {
                var sse = new RMSSSEnhanced();
                var lut = new RMLogUtil('RMAPI.rmAPIPostSingleObject.xhttp',3);
                var resObj = JSON.parse(this.responseText);
                if (resObj['status'] == 'ok') {
                    sse.rmSSEObjMarkNotDirty(objIdIn);
                    lut.log(methNm,'Object ' + objIdIn + ' SHOULD BE MARKED NOT DIRTY NOW!',6);
                    if (indicatorDEl) {
                        indicatorDEl.style.backgroundColor = '#88ff88';
                    }
                } else {
                    lut.log(methNm,'GAH!  UPDATE PUKED! ' + this.responseText,2);
                    //THIS SHOULD PROBABLY NOT BE HERE FOR PRODUCTION... NEED TO STOP RUNAWAY UPDATED THO
                    sse.rmSSEObjMarkNotDirty(objIdIn);
                }
                //logger(methNm + "got back: " + this.responseText,llDebug);
            }
        };
        //logger(methNm + 'Done setting up XMLHttpRequest',llInfo);
        xhttp.open("POST", tmpEndpoint, true); //tmpEndpoint
        xhttp.setRequestHeader("Content-type", "application/json");
        //this.logger(methNm + 'Calling XMLHttpRequest');
        //this.logger(methNm + 'SENDING UPDATE: ' + bodyDataStr,2);
        if (indicatorDEl) {
            indicatorDEl.style.backgroundColor = '#ffff88';
        }

        xhttp.send(bodyDataStr);
        //this.logger(methNm + 'Called XMLHttpRequest');
    }
    //
    rmAPIPostAuthCreds(unmIn,pwdIn)  {
        var methNm = 'rmAPIPostAuthCreds - ';
        var llAlert = 1;
        var llError = 2;
        var llWarn = 3;
        var llDebug = 4;
        var llInfo = 5;
        //console.log(methNm + 'BEGIN');
        var sCfg = this.sse.ssRead('localcfg');
        const apiEndpoint = sCfg.apibaseuri + sCfg.apiepsou;
        var contData = {'uname':unmIn,'passwd':pwdIn};
        
        var tmpEndpoint = '/api/auth';
        //const bodyDataStr = JSON.stringify(updateObj);
        const bodyDataStr = JSON.stringify(contData);
        //logger(methNm + 'bodyDataStr: ' + bodyDataStr,llDebug);
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                //console.log(methNm + 'GOT BACK: ' + this.responseText);
                var sse = new RMSSSEnhanced();
                var resObj = JSON.parse(this.responseText)['result'];
                 if (resObj.hasOwnProperty('stoken')) {
                     if (typeof resObj['stoken'] == 'string') {
                         if (resObj['stoken'].length > 10) {
                            sse.rmSSEStoreSession(resObj);
                            //console.log('JUST WROTE SESSION RESULTS TO SSE');
                         }
                     }
                 }
                //logger(methNm + "got back: " + this.responseText,llDebug);
            }
        };
        //logger(methNm + 'Done setting up XMLHttpRequest',llInfo);
        //xhttp.open("POST", apiEndpoint, true);
        xhttp.open("POST", tmpEndpoint, true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(bodyDataStr);
    }
    // Fetch a single Object from the API, place it in the Object Store and 
    // mark it as "fresh"
    //rmAPIFetchSingleObject(ctrlObj,dataObj) {
    rmAPIUtilCall(actionIn,targetIn,dataObjIn) {
        var methNm = 'rmAPIUtilCall - ';
        var llError = 2;
        var llWarn = 3;
        var llDebug = 4;
        var llInfo = 5;
        // THIS WILL PROBABLY REQUIRE SOME REWORK -- Rather than making all 
        // the calling entities build special data objects and control 
        // objects, we can just pull in those values from SessionStore
        var sCfg = this.sse.ssRead('localcfg');
        const apiEndpoint = sCfg.apibaseuri + 'util';
        //this.logger('apiEndpoint: ' + apiEndpoint,2);

        var tmpSession = this.sse.rmSSEFetchSession();
        var dataObj = {};
        dataObj.sid = tmpSession.token;
        dataObj.tid = tmpSession.treeid;
        if (dataObjIn.hasOwnProperty('tid')){
            dataObj.tid = dataObjIn['tid'];
        }
        if (dataObjIn.hasOwnProperty('oid')){
            dataObj.oid = dataObjIn['oid'];
        }
        
        dataObj.action = actionIn;
        dataObj.target = targetIn
        dataObj.dataobj = dataObjIn;
        
        var d = new Date();
        var ts = d.getTime().toString();
        
        const resultKey = actionIn + targetIn + ts;
        
        //console.log(methNm + 'sending: ' + JSON.stringify(dataObj));  
        
        //logger(methNm + 'BEGIN',llDebug);
        const bodyDataStr = JSON.stringify(dataObj);
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            var sse = new RMSSSEnhanced();
            if (this.readyState == 4 && this.status == 200) {
                var responseObj = JSON.parse(this.responseText);
                //console.log('Got back this.responseText: ' + this.responseText);
                sse.ssOKWrite('misc',resultKey,responseObj['result']);
                //console.log('just called rmSSEOSRefreshWrite ');
            }
        };
        
        //logger('Done setting up XMLHttpRequest',llDebug);
        xhttp.open("POST", apiEndpoint, true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(bodyDataStr);
        return resultKey;
    }
    // Like UtilCall method above, but specific to message processing
    rmAPIMessageCall (actionIn,contentIn,callback) {   // <<===== Include a callback?!  Might be the bext way to ensure follow-on processing 
        //         neededKeyList = ['sid','tid','oid','userid','action','content']
        var methNm = 'rmAPIMessageCall';
        this.loggerEnh(methNm,'BEGIN',6);
        var sCfg = this.sse.ssRead('localcfg');
        const apiEndpoint = sCfg.apibaseuri + 'msg';
        //this.logger('apiEndpoint: ' + apiEndpoint,2);
        
        
        var permittedActionList = ['create','read','update','delete','mark','gettemplate','getusermessages'];
        if (permittedActionList.indexOf(actionIn) < 0) {
            this.loggerEnh(methNm,'Action ' + actionIn + ' is not permitted.  Aborting',2);
            return;
        }

        var tmpSession = this.sse.rmSSEFetchSession();
        if ((tmpSession['sid'] == '') || (tmpSession['sid'] == undefined) || (typeof tmpSession['sid'] != typeof '')) {
            this.loggerEnh(methNm, 'SessionID is not populated - ABORTING', 2);
            return false;
        }
        var dataObj = {};
        dataObj['sid'] = tmpSession['sid'];
        dataObj['tid'] = tmpSession['tid'];
        dataObj['oid'] = tmpSession['oid'];
        dataObj['userid'] = tmpSession['uname'];
        dataObj['action'] = actionIn;
        dataObj['content'] = contentIn;
        
        const bodyDataStr = JSON.stringify(dataObj);
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var responseObj = JSON.parse(this.responseText);
                callback(responseObj['result']);
            }
        };
        
        xhttp.open("POST", apiEndpoint, true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(bodyDataStr);
    }
    // This may be superfluous, but leaving it in for now
    rmAPIssWrite() {
        
    }
    // This may be superfluous, but leaving it in for now
    rmAPIssRead() {
        
    }
    rmAPIstartScriptRender(objIdIn,optionObjIn) {
        var methNm = 'rmAPIstartScriptRender';
        var llError = 2;
        var llWarn = 3;
        var llDebug = 4;
        var llInfo = 5;
        var sCfg = this.sse.ssRead('localcfg');
        const apiEndpoint = sCfg.apibaseuri + 'render';
        //this.logger('apiEndpoint: ' + apiEndpoint,2);

        var tmpSession = this.sse.rmSSEFetchSession();
        var dataObj = {};
        dataObj.sid = tmpSession.token;
        dataObj['tid'] = tmpSession.treeid;
        dataObj.tid = tmpSession.tid;
        dataObj.oid = objIdIn;
        dataObj.data = optionObjIn;
        
        const bodyDataStr = JSON.stringify(dataObj);
        this.loggerEnh(methNm,'Preparing to send data: ' + bodyDataStr + ' to endpoint ' + apiEndpoint,2);
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            //var sse = new RMSSSEnhanced();
            var su = new RMSuperUtil();
            su.setupLogger('RMAPI',3);
            if (this.readyState == 4 && this.status == 200) {
                su.log(methNm,'Got back: ' + this.responseText,2);
                //var responseObj = JSON.parse(this.responseText);
                //console.log('Got back this.responseText: ' + this.responseText);
                //sse.ssOKWrite('misc',resultKey,responseObj['result']);
                //console.log('just called rmSSEOSRefreshWrite ');
            }
        };
        
        //logger('Done setting up XMLHttpRequest',llDebug);
        xhttp.open("POST", apiEndpoint, true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(bodyDataStr);
        return;

        
    }
    // END COMMON API CALLS
}
// Methods for periodically checking on and dealing with state in the 
// application
class RMStateHandler {
    constructor () {
        this.api = new RMAPI();
        this.sse = new RMSSSEnhanced();
        this.logUtil = new RMLogUtil('RMStateHandler',3);
        this.wa = new RMPCWebApp();
    }
    logger (MsgIn,lvlIn) {
        this.logUtil.logLim(MsgIn,lvlIn);
    }
    //// THIS IS THE ONE WE WOULD USE IF WE WERE SMART
    loggerEnh (methNmIn,msgIn,lvlIn) {
        this.logUtil.log(methNmIn,msgIn,lvlIn);
    }
    //  PLACEHOLDER - REPLACE WITH SOMETHING THAT ACTUALLY WORKS!!   <<===  HEY!  READ THIS!
    // This function-in-a-function is a placeholder for one which will
    // check for members in the treedirty list, and (when fully 
    // implemented) post those updates to the API
    checkDirty() {
        var methNm = 'checkDirty - ';
        var dirtyList = this.sse.ssRead('treedirty');
        var dlStr = JSON.stringify(dirtyList);
        if (dlStr != '[]') {
            this.logger(methNm + 'STARTING dirtyList: ' + dlStr);
            for (var dlIdx=0; dlIdx<dirtyList.length; dlIdx++) {
                var oId = dirtyList[dlIdx];
                this.logger(methNm + 'I FOUND A DIRTY WORD! (' + dlIdx + ': ' + oId);
                this.api.rmAPIPostSingleObject(oId);
                this.sse.rmSSEObjMarkNotDirty(oId);
            }
        }
    }

    //  PLACEHOLDER - REPLACE WITH SOMETHING THAT ACTUALLY WORKS!!   <<===  HEY!  READ THIS!
    // This function-in-a-function is a placeholder for one which will
    // check for members in the treefresh list, and (when fully 
    // implemented) post to the appropriate widget in the UI
    checkFresh() {
        var methNm = 'checkFresh - ';
        var freshList = this.sse.ssRead('treefresh');
        var flStr = JSON.stringify(freshList);
        if (flStr != '[]') {
            this.logger(methNm + 'freshList: ' + flStr,2);
            for (var flIdx in freshList) {
                var oId = freshList[flIdx];
                this.logger(methNm + "BEGIN CHECK FRESH for " + oId,2);
                var uiro = new RMPCObjectContentView(oId);
                uiro.refreshValues(oId);
                this.sse.rmSSEObjMarkNotFresh(oId);
            }
        }
    }


    //renderCDEonLoad () {
        //// expecting interval handle to be rolIntervalHandle;
        //// expecting object ID to be oId
        //var sse = new RMSSSEnhanced();
        //var freshList = sse.ssRead('treefresh');
        //var oId = sse.rmSSEFetchSession()['oid']   ;
        //if ( freshList.indexOf(oId) > -1) {
            //console.log("BEGIN RENDER CDE ON LOAD for " + oId);
            //var to = new RMPCTargetObject();
            //to.renderPop(oId,{});
            //sse.rmSSEObjMarkNotFresh(oId);
            //console.log('Rendered CDE for ' + oId);
            //clearInterval(rolIntervalHandle);
        //}
    //}
    
    // works with sse.misc.actstate to wait for a function to be 'rdy' before executing it.
    doFuncWhenReady(rdyKeyIn,callback)  {
        var sse  = this.sse;
        var cMax = 20;
        var cnt = 0;
        function checkForReady () {
            var methNm = 'checkForReady - ';
            this.logger(methNm + 'STARTING RMStateHandler.doFuncWhenReady.checkForReady...',2);
            if (cnt > cMax) {
                this.logger(methNm + 'RMStateHandler.doFuncWhenReady.checkForReady - max count.  dying.',2);
                clearInterval(intvHandle);
            }
            var ready = false;
            var stateObj = sse.ssOKRead('misc','actstate');
            if (stateObj.hasOwnProperty(rdyKeyIn)) {
                // OK, let's get the state, and see if we're OK to request
                this.logger(methNm + 'RMStateHandler.doFuncWhenReady.checkForReady FOUND THE KEY',2);
                var rkVal = stateObj[rdyKeyIn];
                switch (rkVal) {
                    case 'rdy': 
                        this.logger(methNm + 'RMStateHandler.doFuncWhenReady.checkForReady FOUND "rdy"',2);
                        callback();
                        ready = true;
                        break;
                    default:
                        // do nothing, I guess..
                        this.logger(methNm + 'RMStateHandler.doFuncWhenReady.checkForReady DID NOT FOUND "rdy": ' + JSON.stringify(stateObj[rdyKeyIn]),2);
                        break;
                }
            } else {
                this.logger(methNm + 'RMStateHandler.doFuncWhenReady.checkForReady DID NOT FOUND THE KEY',2);
                // We have a garbage key.  Be sad.
                throw('Key ' + rdyKeyIn + ' not found in actstate object');
                clearInterval(intvHandle);
            }
            
            if(ready) {
                clearInterval(intvHandle);
            }
            cnt += 1;
        }
        var intvHandle = setInterval(checkForReady,200);
    }
    getActState(keyIn) {
        var asObj = this.sse.ssOKRead('misc','actstate');
        var retval = asObj;
        if (keyIn != undefined) {
            if (asObj.hasOwnProperty(keyIn)) {
                retval = actState[keyIn];
            }
        }
        return retval;
    }
    setActState(keyIn,valIn){
        var permValsList = [];
        // States are strings: 'rdy' (ready), 'prp' (prepare to send), 'req' (requested), 'rcv' (received), 'prc' (processing), 'sxs' (success), 'fal' (failed)
        permValsList.push('rdy');
        permValsList.push('prp');
        permValsList.push('prp');
        permValsList.push('req');
        permValsList.push('rcv');
        permValsList.push('prc');
        permValsList.push('sxs');
        permValsList.push('fal');
        //permValsList.push('');
        var result = false;
        if (permValsList.indexOf(valIn) > -1){
            var actState = this.getActState();
            if (actState.hasOwnProperty(keyIn)) {
                actState[keyIn] = valIn;
                result = this.sse.ssOKWrite('misc','actstate',actState);
            }
        }
        
        
        
        
        
    }    
    rmpcMainStateCheck() {
        var methNm = 'rmpcMainStateCheck';
        
        // If we don't have a session, let's just leave now.
        var tmpSession = this.sse.rmSSEFetchSession();
        if ((tmpSession['sid'] == '') || (tmpSession['sid'] == undefined) || (typeof tmpSession['sid'] != typeof '')) {
            this.loggerEnh(methNm, 'SessionID is not populated - ABORTING', 2);
            return false;
        }
        
        this.checkDirty();
        this.checkFresh();
        
        var chardiv = document.getElementById('tabrefcont-showchardisplay-body');
        try {
            if ((chardiv.innerHTML != undefined) && (chardiv.innerHTML != 'undefined')) {
                //nothing to do here
                //this.logger(methNm + 'chardiv.innerHTML: ' + chardiv.innerHTML,2);
            } else {
                this.loggerEnh(methNm,'IF Populating Show Character Display',5);
                this.wa.popShowCharDisplay();
            }
        } catch (e) {
            this.loggerEnh(methNm,'CATCH Populating Show Character Display',5);
            this.wa.popShowCharDisplay();
        }
        
        //this.logger(methNm + 'WOOFWOOF - scriptdetaildisplay',2);
        var scrdiv = document.getElementById('tabrefcont-scriptdetaildisplay-body');  // tabrefcont-scriptdetaildisplay-label-kill
        try {
            if ((scrdiv.innerHTML != undefined) && (scrdiv.innerHTML != 'undefined')) {
                //nothing to do here
                //this.logger(methNm + 'chardiv.innerHTML: ' + chardiv.innerHTML,2);
            } else {
                this.loggerEnh(methNm,'IF Populating Script Detail Display',5);
                this.wa.popScriptDetDisplay();
            }
        } catch (e) {
            this.loggerEnh(methNm,'CATCH Populating Script Detail Display',5);
            this.wa.popScriptDetDisplay();
        }

    }
}


