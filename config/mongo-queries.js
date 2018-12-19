let mongodb = require('mongodb');
let assert = require('assert');

module.exports = (function () {
    let MongoClient = mongodb.MongoClient;
    let url = 'mongodb://adminUser:password@35.200.171.190:27017/product_data';
    let main_database;
    MongoClient.connect(url, function (err, database) {
        if (err) {
            console.log('Unable to connect to the mongoDB server. Error:', err);
        } else {
            console.log('Connection established to', url);
            main_database = database;
        }
    });

    let mongo_functions = {
        // Connect to the db
        getResults : (db_name, collection_name, query, callback) =>{
            let db = main_database.db(db_name);
            let collection = db.collection(collection_name);
            collection.find(query, {}).toArray((error, docs)=> {
                callback(docs, error);
                assert.equal(null, error);
            });
        },
        getResultsWithLimit : (db_name, collection_name, query, from, callback) =>{
            let db = main_database.db(db_name);
            let collection = db.collection(collection_name);
            collection.find(query, {}).skip(parseInt(from)*5000).limit(5000).toArray((error, docs)=> {
                assert.equal(null, error);
                callback(docs, error);
            });
        },
        getResultsWithAggregation : (db_name, collection_name, query, callback)=> {
            let db = main_database.db(db_name);
            let collection = db.collection(collection_name);
            collection.aggregate(query, {"allowDiskUse": true}).toArray((error, docs)=> {
                assert.equal(null, error);
                callback(docs, error);
            });
        },
        getResultCount : (db_name, collection_name, query, callback) =>{
            let db = main_database.db(db_name);
            let collection = db.collection(collection_name);
            collection.count(query, (error, number_of_docs)=> {
                assert.equal(null, error);
                callback(number_of_docs, error);
            });
        },
        getDistinctValues : (db_name, collection_name, name, query, callback)=> {
            let db = main_database.db(db_name);
            let collection = db.collection(collection_name);
            collection.distinct(name, query, (error,options)=> {
                assert.equal(null, error);
                callback(options, error);
            });
        },
        insertValuesIntoDb : (db_name, collection_name, query, callback)=> {
            let db = main_database.db(db_name);
            let collection = db.collection(collection_name);
            collection.insert(query, (err, res)=>{
                callback(!err);
            });
        },
        updateValuesIntoDb : (db_name, collection_name, query, update_query, callback)=> {
            let db = main_database.db(db_name);
            let collection = db.collection(collection_name);
            collection.update(query, update_query, {upsert : true}, (err, res)=>{
                callback(!err);
            });
        },

    };
    return mongo_functions;
})();