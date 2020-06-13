/***********************************
 * cages route
 ************************************/
/***********************************
 * Module dependencies.
 * @private
 ************************************/
import express from 'express';
import User from '../server/lib/utils/user';
var router = express.Router();
import config from '../config/index';
import Consent from '../server/lib/utils/consent';

/***********************************
 * Private functions
 ************************************/

function routePrivacyCenterWidget(req,res,consentReceiptSelected){
  Consent.getConsentReceiptChain(req.session.applicationAccessToken,consentReceiptSelected,null,function(consentReceipt){
    if(consentReceipt !=null){
      if(req.session.applicationUserAccessToken){
        Consent.getConsentsChain(req.session.applicationAccessToken,consentReceiptSelected,req.session.applicationUserId,null,function(consents){
          renderPrivacyCenterWidget(req,res,consentReceiptSelected,consentReceipt,consents);
        });
      }
      else
        renderPrivacyCenterWidget(req,res,consentReceiptSelected,consentReceipt);
    }
    else
      renderPrivacyCenterWidget(req,res,consentReceiptSelected);
  });
}

/***********************************
 * routes functions
 ************************************/

/* GET dashboard home */
router.get('/auth/workbench', function (req, res, next) {
  Consent.getConsentReceiptsList(req.session.applicationAccessToken,function (consentReceiptsList){
    renderWorkbench(req,res,consentReceiptsList);
  });
});

/* POST generate privacy center widget */
router.post('/auth/consents/privacyCenter/createWidget', function (req, res, next) {
  routePrivacyCenterWidget(req,res,req.body.consentReceiptSelected);
});

/* GET generate privacy center widget */
router.get('/auth/consents/privacyCenter/createWidgetCallback', function (req, res, next) {
  routePrivacyCenterWidget(req,res,req.query.consentReceiptSelected);
});

/***********************************
 * rendering functions
 ************************************/

/**
 * render dashboard home
 * @param {req} request
 * @param {res} response
 */
function renderWorkbench(req,res,consentReceiptsList){
  var hasConsentReceipts=false;
  if(consentReceiptsList!=null && consentReceiptsList.consentReceipts.length>0)
  hasConsentReceipts=true;  
  res.render('workbench', {
    layout: 'master',
    workbench:'active',
    consentReceiptsList:consentReceiptsList,
    hasConsentReceipts:hasConsentReceipts,
    user:{id:User.getUserId(req.user)},
  });
}

/**
 * render dashboard home
 * @param {req} request
 * @param {res} response
 */
function renderPrivacyCenterWidget(req,res,consentReceiptSelected,consentReceipt,consentsChain){
  console.log(consentReceipt);
  var dataSources="{\"sources\":[";
  for(var i=0;i<consentReceipt.sources.length;i++){
    dataSources+="{\"name\":\""+consentReceipt.sources[i]["gl:name"]+"\",";
    dataSources+="\"description\":\""+consentReceipt.sources[i]["gl:description"]+"\",";
    var arrayId=consentReceipt.sources[i]["@id"].split("/");
    dataSources+="\"id\":\""+arrayId[arrayId.length-1]+"\"}";
    if(i!=consentReceipt.sources.length-1)
      dataSources+=",";
  }
  dataSources+="]}";
  

  var consents="{";

  if(consentsChain){
    var consentsJson=JSON.parse(consentsChain);
    if(consentsJson.main){
      //main consent
      arrayId=consentsJson.main["@id"].split("/");
      var consentStatus=consentsJson.main["gl:hasStatus"]["@id"];
      var consentStatusBoolean=false;
      if(consentStatus=="https://w3id.org/GConsent#ConsentStatusExplicitlyGiven")
        consentStatusBoolean=true;
      var consentDuration=consentsChain.main["gl:hasDuration"]["time:numericDuration"];
      consents+="\""+arrayId[arrayId.length-1]+"\":{\"status\":\""+consentStatusBoolean+"\",\"duration\":\""+consentDuration+"\"},";
    }
    if(consentsChain.sources){
      //data sources consent
      for(i=0;i<consentsChain.sources.length;i++){
        arrayId=consentsChain.sources[i]["@id"].split("/");
        consentStatus=consentsChain.sources[i]["gl:hasStatus"]["@id"];
        consentStatusBoolean=false;
        if(consentStatus=="https://w3id.org/GConsent#ConsentStatusExplicitlyGiven")
          consentStatusBoolean=true;
        
        var consentDuration=consentsChain.sources[i]["gl:hasDuration"]["time:numericDuration"];
        consents+="\""+arrayId[arrayId.length-1]+"\":{\"status\":\""+consentStatusBoolean+"\",\"duration\":\""+consentDuration+"\"},";
      }
    }
  }
  if(consentsChain)
    consents=consents.substr(0,consents.length-1);
  consents+="}";
  var rootDomainDemoApp=config.rootDomainDemoApp;
  var rootDomainPassportApp=config.rootDomainPassportApp;
  var callback=rootDomainDemoApp+'/auth/consents/privacyCenter/createWidgetCallback?consentReceiptSelected='+consentReceiptSelected;
  var consentReceiptUri="https://api.datavillage.me/consentReceipts/"+consentReceiptSelected;
  res.render('privacy-center-widget', {
    layout: 'singlePage',
    user:{id:User.getUserId(req.user)},
    consentReceipt:{id:consentReceiptSelected,name:consentReceipt.main["gl:name"],description:consentReceipt.main["gl:description"],purpose:consentReceipt.main["gl:forPurpose"]["gl:description"]},
    dataSources:JSON.parse(dataSources),
    consents:JSON.parse(consents),
    actionActivateConsent:rootDomainPassportApp+'/oauth/authorize?client_id='+req.session.clientId+'&redirect_uri='+callback+'&response_type=code&scope='+consentReceiptUri+'&state=empty',
    actionDesactivateConsent:rootDomainPassportApp+'/oauth/token/revoke'
  });
} 

module.exports = router;
