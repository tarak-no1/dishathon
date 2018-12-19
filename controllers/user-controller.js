module.exports = (function () {
    const MONGO = require('../config/mongo-queries');
    const {ObjectId} = require('mongodb');

    let getObjectImages = (object_id, callback)=>{
        let mongo_query = [{"$match":{"object_id" : object_id}}, {"$sort":{"time":1}}];
        MONGO.getResultsWithAggregation('dishathon', 'boxes', mongo_query, (docs, errors)=>{
            let all_images = docs.map((doc)=> {
                return doc['image_path'];
            });
            callback(all_images);
        });
    };
    let getVideoTimelineAttributes = (object_id, callback)=>{
        let mongo_query = {"object_id" : object_id};
        console.log("Mongo Query : ", mongo_query);
        MONGO.getResultsWithAggregation('dishathon', 'objects', {"$match":mongo_query}, (docs, error)=> {
            console.log(docs);
            if(docs.length>0){
                let required_doc = docs[0];
                let attributes = required_doc.hasOwnProperty('attributes')?required_doc['attributes']:{};
                callback(attributes);
            }
            else{
                callback({});
            }
        });
    };
    let getSimilarProducts = (attributes, callback)=>{
        // let products_based_on_attributes_query = { "$match" : attributes };
        let required_fields = {
            _id : 1,
            product_link : 1,
            image_link_default : 1,
            price : 1,
            company_name : 1
        };
        let project_attr_query = {}, all_attributes = [];
        Object.keys(attributes).forEach((attr)=>{
            let changed_attr = attr+"_1";
            all_attributes.push("$"+changed_attr);
            project_attr_query[changed_attr] = {
                "$cond": [ { $eq: ["$"+attr, attributes[attr] ] }, 1, 0]
            };
        });
        let products_based_on_attributes_query = [{"$match" : {}}];
        if(all_attributes.length>0) {
            products_based_on_attributes_query = [
                {
                    "$project": Object.assign(project_attr_query, required_fields)
                },
                {
                    "$project": Object.assign(required_fields, {"total": {"$add": all_attributes}})
                },
                {
                    "$sort": {"total": -1}
                },
                {
                    "$group": {
                        "_id": '$max_cpc',
                        "doc": {"$push": '$$ROOT'}
                    }
                },
                {"$sort": {"_id": -1}},
                {"$limit": 1}
            ];
        }
        console.log(JSON.stringify(products_based_on_attributes_query, null, 2));
        MONGO.getResultsWithAggregation('dishathon', 'fashion_inventory', products_based_on_attributes_query, (docs, err)=> {
            console.log("Docs length : ",docs[0]['doc'].length);
            let result_docs = docs[0]['doc'];
            try{
                result_docs = result_docs.map((doc)=>{
                    let company_name = doc['company_name'];
                    company_name = company_name.split('@')[0];
                    doc['company_name'] = company_name;
                    return doc;
                });
            }catch (e) {
            }
            callback(docs[0]['doc']);
        });
    };

    let getObjectsOnPausedPosition = (video_name, paused_position_time, callback)=>{
        // console.log(paused_position_time);
        let mongo_query = {"$match":{"video_id":video_name, "start_time":{"$lte":paused_position_time}, "end_time":{"$gte":paused_position_time}}};
        MONGO.getResultsWithAggregation('dishathon', 'objects', mongo_query, (docs, errors)=>{
            // console.log("Objects Length : ", docs.length, errors);
            callback(docs);
        });
    };
    let getObjectBoxes = (objects, paused_position_time, callback)=> {
        let boxCoordinatePromise = (mongo_query)=>{
            return new Promise((revolve, reject)=> {
                MONGO.getResultsWithAggregation('dishathon', 'boxes', mongo_query, (docs, err)=> {
                    let result = {};
                    try {
                        let required_doc = docs[0]['doc'];
                        result['object_id'] = required_doc['object_id'];
                        result['time'] = required_doc['time'];
                        result['box_coordinates'] = required_doc['box_coordinates'];
                    }catch (e) {console.log("error : ",e);}
                    revolve(result);
                });
            });
        };
        let box_coordinate_promises = objects.map((obj)=>{
            let mongo_query = [
                {"$match":{"object_id":obj['object_id']}},
                {"$project": {"diff": {"$abs": {"$subtract": [paused_position_time, "$time"]}}, "doc": '$$ROOT'}},
                {"$sort": {"diff": 1}},
                {"$limit": 1}
            ];
            return boxCoordinatePromise(mongo_query);
        });
        Promise.all(box_coordinate_promises).then((result)=>{
            // console.log(result);
            result = result.filter((data)=>{
                return Object.keys(data).length>0;
            });
            callback(result);
        });
    };
    let user_functions = {
        createUserDetails : (device_id, callback)=>{
            let mongo_query = {"device_id":device_id};
            MONGO.getResultCount('dishathon', 'users', mongo_query, (number_of_docs, error)=>{
                if(number_of_docs==0){
                    let create_user_details_query = {
                        "device_id" : device_id,
                        "favorites" : []
                    };
                    MONGO.insertValuesIntoDb('dishathon', 'users', create_user_details_query, (success_status)=>{
                        callback();
                    });
                }
                else{
                    callback();
                }
            });
        },
        getPositionBoxes : (content, callback)=>{
            let video_name = content['video_name'];
            let paused_position_time = parseInt(content['paused_position_time']);
            getObjectsOnPausedPosition(video_name, paused_position_time, (objects)=>{
                getObjectBoxes(objects, paused_position_time, callback);
            });
        },
        getInventory : (content, callback)=> {
            console.log(content);
            let object_id = content['object_id'];
            getObjectImages(object_id, (similar_images)=>{
                getVideoTimelineAttributes(object_id, (attributes)=>{
                    console.log("Attributes : ",attributes);
                    delete attributes['sleeve_type'];
                    delete attributes['neck'];
                    // delete attributes['pattern_type'];
                    delete attributes['tops_length'];
                    let all_att_values = Object.keys(attributes).map((attr)=>{
                        return attributes[attr];
                    });
                    let title = all_att_values.join(" ");
                    getSimilarProducts(attributes, (results) => {
                        callback(attributes, results, similar_images);
                    });
                });
            });
        },
        storeFavorites : (device_id, product_id, callback)=>{
            let mongo_query = {"device_id" : device_id};
            let updated_query = {"$addToSet" : {"favorites":product_id}};
            MONGO.updateValuesIntoDb('dishathon', 'users', mongo_query, updated_query, (success_status)=> {
                callback(success_status);
            });
        },
        getFavorites : (device_id, callback)=>{
            let favorites_query = {"$match":{"device_id":device_id}};
            console.log(favorites_query);
            MONGO.getResultsWithAggregation('dishathon', 'users', favorites_query, (docs, error)=> {
                console.log(docs);
                if(docs.length>0){
                    let favorites_query = docs[0]['favorites'].map((product_id)=>{
                        if (!ObjectId.isValid(product_id)) {
                            return Promise.reject(new TypeError(`Invalid id: ${id}`));
                        }
                        return {"_id":ObjectId(product_id)}
                    });
                    let product_query = {"$match": {"$or":favorites_query}};
                    MONGO.getResultsWithAggregation('dishathon', 'fashion_inventory', product_query, (docs, error)=>{
                        callback(docs);
                    });
                }
                else {
                    callback([]);
                }
            });
        }
    };
    return user_functions;
})();