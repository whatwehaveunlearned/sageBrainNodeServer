var express = require('express')
    , app = express()
    // , app3002 = express()
    
var Nodepath = require('path');
var os = require('os');
var fs = require('fs');
var http = require('http')
    , server3000 = http.createServer(app);
    // , server3002 = http.createServer(app3002)
var WebSocket = require('ws')
    , wss3000 = new WebSocket.Server({ server3000 });
    // , wss3002 = new WebSocket.Server({ server3002 });
var request = require('request');
var lda = require('lda');
var Scraper = require ('images-scraper')
    , google = new Scraper.Google()
    , bing = new Scraper.Bing()
    , yahoo = new Scraper.Yahoo()
    , pics = new Scraper.Picsearch();
var pdfParser = require("pdf2json")
    , pdfParser = new pdfParser(this,1);
var scholar = require('google-scholar');
var thesaurus = require("thesaurus");
var papermonk = require("papermonk");
//Google Image Suggestions
var suggestions = require('google-image-suggestions');
var uid = require('uid-safe');
//Text Similarity simple Cosine Similarity
var textsimilarity = require('textsimilarity');

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
//Form Data
var FormData = require('form-data');
//Zerorpc Server
var zerorpc = require("zerorpc");
//Query String
var querystring = require("query-string")
//File Reader
// var FileReader = require('filereader')
//File-Api
var FileAPI = require('file-api')
  , File = FileAPI.File
  , FileList = FileAPI.FileList
  , FileReader = FileAPI.FileReader
  ;



//Initialize variables to send between apps
var topicsObjects = [];
var papersObjects = [];
var session;
var session_path = "../brain/sessData/"

//SAGE MESSAGES
// wss.on('connection', function (ws){

//     ws.on('message', function (data, flags) {
//         data = JSON.parse(data);
//         if(data.type === "document"){
//             let url = data.url;
//             let fileName = getFile(url);
//         }else if(data.type === "brainstorming"){
//             console.log(data);
//         }else{
//             console.log("ERROR!!!");
//         }
//     });
// });

function getFile(url){
    let fileName = url.split('/')[url.split('/').length-1];
    let file = fs.createWriteStream(fileName);
    let request = http.get(url, function(response) {
        response.pipe(file);
        return fileName;
    });
    file.on('finish', function(){
        parseDoc(fileName);
    });
}

function simulatedBrainstorming(){
    fs.readFile('/Users/agonzamart/Projects/LAVALAB/ExtraProjects/Brainstorming/meetingNotes.json','utf8', (err, data) => {
        session.addTranscript(JSON.parse(data));
    })
}

function parseDoc(fileName){
    doc = new Document("user",fileName)
    client.invoke("docInterface", session.id,fileName, doc.id, function(error, res, more) {
        let docData = res.toString("utf8")
        session.addDocument(doc.fillData(JSON.parse(docData)));
    });
}
//CODE THAT WILL GO INSIDE THE SAGE MESSAGE
session = new Session();
//getFile("http://168.105.18.142:9292/user/pdfs/Kawano_Destiny_EI201701.pdf");
// parseDoc("test.pdf");
// simulatedBrainstorming();
// //////////////

///START HERE !!!!!!
var sageBrain = new zerorpc.Client({ timeout: 500000, heartbeatInterval: 120000 });
let collection_items;
let dataKeys;
sageBrain.connect("tcp://127.0.0.1:9000");
server3000.listen(3000);
server3002.listen(3002);

wss3000.on('connection',function(ws){
    console.log('conection OK');
    sageBrain.invoke("Zotero","getCollections",false,false,false, function(error, res, more) {
        console.log(res);
        ws.send(JSON.stringify({
            "message" : res,
            "type" : "collections"
        }));
    });
    ws.on('message',function(msg){
        msg = JSON.parse(msg);
        console.log(msg);
        if(msg.type==="collections"){
            sageBrain.invoke("Zotero","getCollectionItems",msg.msg,false,false, function(error, res, more) {
                collection_items = JSON.parse(res)
                dataKeys = []
                for (let i=0;i<collection_items.length;i++){
                    dataKeys.push(collection_items[i].pdf_file)
                }
                ws.send(JSON.stringify({
                    "message" : collection_items,
                    "type" : "collection_items"
                }));
            })
        }else if(msg.type === "add_papers"){
            sageBrain.invoke("Zotero","downloadItems", false, dataKeys,collection_items, function(error, res, more) {
                    console.log(res);
                    let files_to_sage = res;
                    sageBrain.invoke("DocInterface",false,'0','zoteroCollection',collection_items, function(error, res, more) {
                        let collection_metadata = res;
                        //Send Information to Zotero
                        ws.send(JSON.stringify({
                            // "message" : {'doc':collection_topics.documents,'topics':JSON.parse(collection_topics.topics),'words':JSON.parse(collection_topics.words)},
                            "message": {'doc_topics':{'topics':JSON.parse(collection_metadata.doc_topics.topics), 'order':JSON.parse(collection_metadata.doc_topics.order), 'words':JSON.parse(collection_metadata.doc_topics.words)},'years':JSON.parse(collection_metadata.years),'authors':JSON.parse(collection_metadata.authors)},
                            "type" : "sageBrain_data"
                        }));

                    });
                });
        }
    })
    // ws.on('message',function(msg){
    //     console.log(msg);
    //     msg = JSON.parse(msg);
    //     if(msg.type==="collections"){
    //         sageBrain.invoke("Zotero","getCollectionItems",msg.msg,false,false, function(error, res, more) {
    //             let collection_items = JSON.parse(res)
    //             let dataKeys = []
    //             for (let i=0;i<collection_items.length;i++){
    //                 dataKeys.push(collection_items[i].pdf_file)
    //             }
    //             sageBrain.invoke("Zotero","downloadItems", false, dataKeys,collection_items, function(error, res, more) {
    //                 console.log(res);
    //                 let files_to_sage = res;
    //                 sageBrain.invoke("DocInterface",false,'0','zoteroCollection',collection_items, function(error, res, more) {
    //                     let collection_metadata = res;
    //                     //Send Information to Zotero
    //                     ws.send(JSON.stringify({
    //                         // "message" : {'doc':collection_topics.documents,'topics':JSON.parse(collection_topics.topics),'words':JSON.parse(collection_topics.words)},
    //                         "message": {'doc_topics':{'topics':JSON.parse(collection_metadata.doc_topics.topics), 'order':JSON.parse(collection_metadata.doc_topics.order), 'words':JSON.parse(collection_metadata.doc_topics.words)},'years':JSON.parse(collection_metadata.years),'authors':JSON.parse(collection_metadata.authors)},
    //                         "type" : "collection_topics"
    //                     }));

    //                 });
    //                 ws.send(JSON.stringify({
    //                     "message" : collection_items,
    //                     "type" : "collection_items"
    //                 }));
    //             });
    //         });
    //     }else if(msg.type==="items"){
    //         var dataKeys = msg.msg;
    //         console.log(msg.msg)
    //         sageBrain.invoke("downloadItems",false,false,[dataKeys], function(error, res, more) {
    //             sageBrain.invoke("DocInterface",res[0]+'.pdf','0','item','metadata', function(error, res, more) {
    //                 console.log(res)    
    //             });
    //             console.log(res);
    //         });
    //     }
    // });
});

// //Zotero Interface
// app.get('/zotero',function(req,res){
//     wss.on('connection',function(ws){
//             console.log('conection OK');
//             sageBrain.invoke("Zotero","getCollections",false,false,false, function(error, res, more) {
//                 console.log(res);
//                 ws.send(JSON.stringify({
//                     "message" : res,
//                     "type" : "collections"
//                 }));
//             });
//         ws.on('message',function(msg){
//             console.log(msg);
//             msg = JSON.parse(msg);
//             if(msg.type==="collections"){
//                 sageBrain.invoke("Zotero","getCollectionItems",msg.msg,false,false, function(error, res, more) {
//                     let collection_items = JSON.parse(res)
//                     let dataKeys = []
//                     for (let i=0;i<collection_items.length;i++){
//                         dataKeys.push(collection_items[i].pdf_file)
//                     }
//                     sageBrain.invoke("Zotero","downloadItems", false, dataKeys,collection_items, function(error, res, more) {
//                         console.log(res);
//                         let files_to_sage = res;
//                         sageBrain.invoke("DocInterface",false,'0','zoteroCollection',collection_items, function(error, res, more) {
//                             let collection_metadata = res;
//                             //Send Information to Zotero
//                             ws.send(JSON.stringify({
//                                 // "message" : {'doc':collection_topics.documents,'topics':JSON.parse(collection_topics.topics),'words':JSON.parse(collection_topics.words)},
//                                 "message": {'doc_topics':{'topics':JSON.parse(collection_metadata.doc_topics.topics), 'order':JSON.parse(collection_metadata.doc_topics.order), 'words':JSON.parse(collection_metadata.doc_topics.words)},'years':JSON.parse(collection_metadata.years),'authors':JSON.parse(collection_metadata.authors)},
//                                 "type" : "collection_topics"
//                             }));

//                         });
//                         ws.send(JSON.stringify({
//                             "message" : collection_items,
//                             "type" : "collection_items"
//                         }));
//                     });
//                 });
//             }else if(msg.type==="items"){
//                 var dataKeys = msg.msg;
//                 console.log(msg.msg)
//                 sageBrain.invoke("downloadItems",false,false,[dataKeys], function(error, res, more) {
//                     sageBrain.invoke("DocInterface",res[0]+'.pdf','0','item','metadata', function(error, res, more) {
//                         console.log(res)    
//                     });
//                     console.log(res);
//                 });
//             }
//         });
//     });
//     res.sendFile(__dirname + '/apps/zotero/zotero.html')
// });

// //Brainstorming TOPICS APP
// app.get('/topics1',function(req,res){
//     wss.on('connection',function(ws){
//         let initialText = session.transcript[0];
//         let topicsId = 0;
//         let groupSize=parseInt(initialText.length/15);
//         //Topics here is an array each groups of words I push the current topics into the array
//         //This is the simulation of getting topics in small chunks
//         let topics=[];
//         for (let j = 0; j < initialText.length; j=j+groupSize) {
//             setTimeout(function(){
//                 let simulatedTopics = [];
//                 let newGroup;
//                 let regExpression;
//                 let similarityValue;
//                 for(let w=0;w<groupSize;w++){
//                     if(initialText[j+w]) simulatedTopics.push(initialText[j+w].clientInput);
//                 }
//                 newGroup = new Topics(topicModeler(simulatedTopics,1,5));
//                 if(session.topicGroups.length>0){
//                     session.topicGroups.forEach(function(topicGroup,index){
//                         regExpression = new RegExp(",","g");
//                         similarityValue = textsimilarity(topicGroup.words.toString().replace(regExpression," "),newGroup.words.toString().replace(regExpression," "));
//                         if( similarityValue > 0.25){
//                             console.log("SessionGroup" + index + " : " + topicGroup.words.toString());
//                             console.log("NewGroup: " + newGroup.words.toString());
//                             console.log("Similarity: " + similarityValue);
//                             topicGroup.addChild(topicGroup.id,newGroup.id,similarityValue);
//                             newGroup.addParent(topicGroup.id);
//                             console.log(topicGroup.childs);
//                         }
//                     })
//                 }
//                 if(newGroup) session.addTopicGroup(newGroup);
//                 ws.send(JSON.stringify({
//                     "message" : session,
//                     "type" : "topics"
//                 }));
//             },500*j)
//         }
//     });
//     res.sendFile(__dirname + '/topics.html')
// });

// //TOPICS APP
// app.get('/topics',function(req,res){
//     wss.on('connection',function(ws){
//         let initialText = session.documents[0].text.split(os.EOL);
//         let topicsId = 0;
//         let groupSize=parseInt(initialText.length/15);
//         //Topics here is an array each groups of words I push the current topics into the array
//         //This is the simulation of getting topics in small chunks
//         let topics=[];
//         for (let j = 0; j < initialText.length; j=j+groupSize) {
//             setTimeout(function(){
//                 let simulatedTopics = [];
//                 let newGroup;
//                 let regExpression;
//                 let similarityValue;
//                 //First we check if it is the first round of topics if it is not I compare with previous topics)
//                 simulatedTopics.push(initialText[j]);
//                 for(let w=0;w<groupSize;w++){
//                     if(initialText[j+w]) simulatedTopics.push(initialText[j+w]);
//                 }
//                 newGroup = new Topics(topicModeler(simulatedTopics,1,5));
//                 if(session.topicGroups.length>0){
//                     session.topicGroups.forEach(function(topicGroup,index){
//                         regExpression = new RegExp(",","g");
//                         similarityValue = textsimilarity(topicGroup.words.toString().replace(regExpression," "),newGroup.words.toString().replace(regExpression," "));
//                         if( similarityValue > 0.3){
//                             console.log("SessionGroup" + index + " : " + topicGroup.words.toString());
//                             console.log("NewGroup: " + newGroup.words.toString());
//                             console.log("Similarity: " + similarityValue);
//                             topicGroup.addChild(topicGroup.id,newGroup.id,similarityValue);
//                             newGroup.addParent(topicGroup.id);
//                             console.log(topicGroup.childs);
//                         }
//                     })
//                 }
//                 if(newGroup) session.addTopicGroup(newGroup);
//                 ws.send(JSON.stringify({
//                     "message" : session,
//                     "type" : "topics"
//                 }));
//             },j)
//         }
//     });
//     res.sendFile(__dirname + '/papers.html')
// });

// //IMAGES APP
// app.get('/images', function (req,res){
// 	var media = [];
// 	var go = true;
//     wss.on('connection', function (ws){
// 		fs.readFile('/Users/agonzamart/Projects/LAVALAB/ExtraProjects/Brainstorming/meetingNotes.json','utf8', (err, data) => {
//             //if (err) throw err;
//             //Initialize the topics
//             let topicsObjects = [];
//             let topicsObjectsCount = 0;
//             let papersObjects = [];
//             let thesaurusTopics = [];
//             let orderedRelatedTopics;
//             let orderedRelatedTopicsCount = 0;
//             let wordsObjects = [];
// 	        // let initialText = JSON.parse(data);
// 	        //Test to get the topics in small amounts
// 	        // var topics = topicModeler(initialText,8,5);
// 	        // var topicsId = 0;
// 	        // for(var i=0; i<topics.length; i++){
//              //    topicsObjects.push(new Topics(topicsId,topics[i]));
//             // }
//             session.topicGroups.forEach(function(topic,index){
//                 var thisTopic = topic;
//                 topic.words.forEach(function(obj){
//                     obj.forEach(function(word){
//                         wordsObjects.push(new Words(word,index,"id","synonyms","antonyms"));
//                     });
//                 });
//                 // scholar.search(topic.words.toString()).then(function(resultsObj) {
//                 //     papersObjects.push ({"result":resultsObj,"topicGroup":topicsObjects[papersObjects.length].words});
//                 // }).catch(err => {
//                 //     done();
//                 //     console.log(err);
//                 // })
//                 // papermonk.download("http://httpbin.org/get",{"pdf":true},function(bibliodata,pdfstream){
//                 //     console.log("metadata: " + bibliodata);
//                 // })
//             });
//             //We calculate the Topics
//             //We check if we have some synonyms if we do we execute update if not we wait
//             setInterval(function () {
//                 if (wordsObjects[wordsObjects.length-1].synonyms && go == true) {
//                     console.log(wordsObjects[0].synonyms);
//                     go = false;
//                     wordsObjects.forEach(function (word) {
//                         var wordID = word.topicID;
//                         var wordText = word.word;
//                         if(word.synonyms !== "none") {
//                             word.synonyms.forEach(function (synonym) {
//                                 if(synonym !== wordText) thesaurusTopics.push({ "topic": synonymTopic(session.topicGroups[wordID], synonym, wordText,wordID), "thesaurusWord": synonym});
//                             })
//                         }
//                     });
//                     orderedRelatedTopics = orderThesaurusTopics(thesaurusTopics,session.topicGroups);
//                     //Every 30 Seconds we send the images from each of the synonym topics.
//                     setInterval(function(){
//                         if(orderedRelatedTopicsCount<orderedRelatedTopics.length){
//                             imageSearch(orderedRelatedTopics[orderedRelatedTopicsCount].topic.words, ws, "synonym",orderedRelatedTopics[orderedRelatedTopicsCount].topic,3);
//                             orderedRelatedTopicsCount++;
//                         }
//                     },20000)
//                 }
//             }, 5000);
//             setInterval(function(){
//                 if(topicsObjectsCount<session.topicGroups.length){
//                     imageSearch(session.topicGroups[topicsObjectsCount].words[0],ws,"default",session.topicGroups[topicsObjectsCount],100);
//                     topicsObjectsCount++;
//                 }
//             },20000);
// 	    });
//      });
// 	res.sendFile(__dirname + '/images.html');
// });

// //************ Prototyping Functions *******

// //Session Prototype
// function Session() {
//     this.id = uid.sync(18);
//     this.topicGroups = [];
//     this.transcript=[];
//     this.documents = [];
//     this.addTopicGroup = function(topicGroup){
//         this.topicGroups.push(topicGroup)
//     }
//     this.addTranscript = function(transcript){
//         this.transcript.push(transcript);
//     }
//     this.addDocument =  function(doc){
//         this.documents.push(doc);
//     }
// }

// //Document Object Prototype
// function Document(user,name){
//     this.id = uid.sync(18);
//     this.user = user;
//     this.name =name;
//     this.text;
//     this.toc;
//     this.topics;
//     this.fillData = function(doc){
//         this.user = doc.user;
//         this.text = doc.text;
//         this.toc = doc.toc;
//         this.topics = doc.topics;
//     }
// }
// //Scholar Object Prototype
// function ScholarPaper(authors,citedCount,description,relatedURL,title,url,topicGroup){
//     this.authors = authors;
//     this.citedCount = citedCount;
//     this.description = description;
//     this.relatedURL = relatedURL;
//     this.title = title;
//     this.url = url;
//     this.topicGroup = topicGroup;
// }
// //Topics Prototype
// function Topics(elements,parent){
//     do{
// 	   this.id = uid.sync(18);
//     }while(/^\d.*/.test(this.id))
// 	this.elements = elements.topics;
// 	this.text = elements.text;
//     if(parent)
//         this.words=this.elements;
//     else{
//         this.words=[];
//         for(let i=0; i<this.elements.length ;i++){
//             let topicArray=[];
//             for(let j=0; j<this.elements[i].length;j++){
//                 topicArray.push(this.elements[i][j].term)
//             }
//             this.words.push(topicArray);
//         }
//     }
// 	//Holds later continuing topics
//     this.childs = [];
//     //Holds synonyms topics
//     this.synonyms = [];
// 	if ( parent )   this.parents = { "id": parent.topic, "link": parent.link };
// 	else    this.parents = [];
//     this.addParent = function(parent){
//         this.parents.push({"id":parent});
//     };
//     this.addChild = function(parent,child,value){
//         this.childs.push({"source":parent, "target":child,"value":value});
//     };
//     this.addSynonym = function(childTopic,link){
//         this.childs.push({ "objectID":childTopic, "link":link });
//     };
// }
// //Word Object Prototype
// function Words(word,topicID,id,synonyms,antonyms){
// 	this.word = word;
// 	this.topicID = topicID;
// 	this.id = uid.sync(18);
// 	this.getSynonyms = function(){
//         var appId = '18daaced';
//         var appKey = 'ccc110eb09d0d182c3dd5247803ed77a';
//         var synonyms;
//         var wordObect = this;
//         language ='en';
//         var myUrl = 'https://od-api.oxforddictionaries.com/api/v1/entries/' + language + '/' + word.toLowerCase() + '/synonyms';
//         request({
//             url: myUrl,
//             headers: {
//                 'app_id':  appId,
//                 'app_key': appKey
//             },
//         }, function(error,res,body){
//             var results;if(res && res.statusMessage === "OK"){
//                 results = JSON.parse(res.body).results[0];
//                 synonyms = results.lexicalEntries[0].entries[0].senses[0].synonyms.map(function(obj){
//                     return obj.text;
//                 });
//                 wordObect.synonyms = synonyms;
//             }else{
//                 wordObect.synonyms = "none";
//             }
//         });
//     };
//    //this.synonyms = this.getSynonyms();
//     this.synonyms = thesaurus.find(this.word);
//     //Google Related Images
//     suggestions.get(this.word,(err,res) => {
//         if(res.list.length > 0){
//             for(var i=0;i<res.list.length;i++){
//                 if(res.list[i].full) this.synonyms.push(res.list[i].full);
//             }
//         }
//     })
// 	this.antonyms = antonyms;
// }



// //********************** END Prototyping Functions *********

// //Function to model topics from a json Object.
// function topicModeler(data,topics,terms_per_topic){
//     var text = "";
//     var documents = [];
//     data.forEach(function(d){
//         text = text + d;
//         if(d!=="") documents.push(d);
//     });
//     return {"text": documents, "topics": lda(documents,topics,terms_per_topic)}
// }

// function imageSearch(query,socket,type,topicObject,numImages){
//     var searchQuery = "";
//     query.forEach(function(element){
//         searchQuery = searchQuery + " " + element
//     });
//     //Google
//     google.list({
//         keyword: searchQuery,
//         num: numImages,
//         rlimit: '10',
//         detail: true,
//     })
//         .then(function (res) {
//             sendData(res,socket,type,query,topicObject);
//         }).catch(function(err) {
//         console.log('err', err);
//     });
// }

// function image(query, socket,type) {
// 	//var appId = '9c1480d3cc844b5db5b78def68075d90' FREE
//     var appId = '3a3d46a82ed148c186b0d32297dfc376'; //Paid
//     //var azureKey = new Buffer(appId).toString('base64');
//     var $searchQuery = "";
//     query.forEach(function(element){
//     	$searchQuery = $searchQuery + "%20" + element
//     });
//     var myUrl = 'https://api.cognitive.microsoft.com/bing/v5.0/images/search?q='+ $searchQuery + '&count=10&offset=0&mkt=en-us';
//     console.log(myUrl);
//     request({
//         url: myUrl,
//         headers: {
//             //'Authorization': 'Basic ' + azureKey
//             "Ocp-Apim-Subscription-Key": appId
//         },
//     }, function(error,res,body){
//         //console.log(error);
//         if(res && res.statusMessage === "OK"){
//         	results = JSON.parse(res.body).value.map(function(element){
//         		 return element.contentUrl;
//         	});
//         	console.log(results);
//         	socket.send(JSON.stringify({
//         	    "message" : JSON.stringify(results),
//                 "type" : type
//             })
//             )
//         }else{
//             console.log("Error: "+ error);
//             if(res) console.log("Status:" + res.statusMessage);
//         }
//    });
// }

// function antonyms(word,socket){
// 	var appId = '18daaced';
// 	var appKey = 'ccc110eb09d0d182c3dd5247803ed77a';
// 	language ='en';
// 	var myUrl = 'https://od-api.oxforddictionaries.com/api/v1/entries/' + language + '/' + word.toLowerCase() + '/antonyms';
// 	request({
//         url: myUrl,
//         headers: {
//             'app_id':  appId,
//             'app_key': appKey
//         },
//     }, function(error,res,body){
//         //console.log(JSON.parse(res.body).results[0].lexicalEntries[0].entries);
//  		//socket.send(JSON.stringify(JSON.parse(res.body).results[0].lexicalEntries[0].entries));
//  		//socket.send(JSON.stringify(JSON.parse(res.body).results[0].lexicalEntries[0].entries.senses[0].antonyms[0].text));
//    });
// }

// function sendData(results, socket,type,topicGroup,topicObject){
//     var output=[];
//     results.forEach(function(element){
//         output.push(element.url)
//     });
//     socket.send(JSON.stringify({
//             "message" : output,
//             "type" : type,
//             "topicGroup":topicGroup,
//             "topicObject": topicObject
//         })
//     );
// }

// function synonymTopic(topicGroup,synonym,wordToExchange,topicsId){
//     var newTopicGroupWords = [];
//     var newTopicGroup;
//     topicGroup.words.forEach(function(element){
//         if(element === wordToExchange){
//             newTopicGroupWords.push(synonym);
//         }else{
//             newTopicGroupWords.push(element);
//         }
//     });
//     //Create the new topic with a specific parent  !!!! Might need change on the newTopicWords if topicWords are groups of topics I set it to 0 now
//     newTopicGroup = new Topics({"topics":newTopicGroupWords[0]},{"topic": topicGroup.id, "link":[synonym,wordToExchange]});
//     //Add a child to the parent
//     topicGroup.addChild(newTopicGroup.id,[wordToExchange,synonym]); //This will probably stop working I set up now for topics to have 2 different properties child and synonyms.
//     return newTopicGroup;
// }

// function orderThesaurusTopics(thesaurusTopics,defaultTopics){
//     var outputArray = [];
//     //Get index orders of default Topics
//     defaultTopics.forEach(function(dTopic){
//         var ID= dTopic.id;
//         thesaurusTopics.forEach(function(tTopic){
//             if(tTopic.topic.parents.id===ID){
//                 outputArray.push(tTopic);
//             }
//         })
//     });
//     return outputArray;
// }