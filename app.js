const express = require('express');
const app = express();

var http = require('http')

// server = http.createServer(app).listen(3000)
// server2 = http.createServer(app).listen(3002)

var WebSocket = require('ws')
server = http.createServer(app).listen(3000)
wss1= new WebSocket.Server({ server })
server = http.createServer(app).listen(3002)
wss2= new WebSocket.Server({ server })

var pdfParser = require("pdf2json")
    , pdfParser = new pdfParser(this,1);
//Zerorpc
var zerorpc = require("zerorpc");

///START HERE !!!!!!
var sageBrain = new zerorpc.Client({ timeout: 500000, heartbeatInterval: 120000 });
let collection_items;
let collection_metadata;
let dataKeys;
sageBrain.connect("tcp://127.0.0.1:9000");

wss1.on('connection',function connection(ws,req){
    console.log('conection 3000 OK');
    console.log(req)
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
                    collection_metadata = res;
                    //Send Information to Zotero
                    ws.send(JSON.stringify({
                        "message": {'doc_topics':{'topics':JSON.parse(collection_metadata.doc_topics.topics), 'order':JSON.parse(collection_metadata.doc_topics.order), 'words':JSON.parse(collection_metadata.doc_topics.words)},'years':JSON.parse(collection_metadata.years),'authors':JSON.parse(collection_metadata.authors)},
                        "type" : "sageBrain_data"
                    }));
                });
            });
        }
    })
})

// wss2.on('connection',function connection(ws,req){
//     console.log('conection OK from 3002');
//     ws.send(JSON.stringify({
//         "message": {'doc_topics':{'topics':JSON.parse(collection_metadata.doc_topics.topics), 'order':JSON.parse(collection_metadata.doc_topics.order), 'words':JSON.parse(collection_metadata.doc_topics.words)},'years':JSON.parse(collection_metadata.years),'authors':JSON.parse(collection_metadata.authors),'papers':collection_items},
//         "type" : "sageBrain_data"
//     }));
// })