module.exports = (function () {
    const MONGO = require('../config/mongo-queries');
    const csv_parse = require('csv-parse');
    const fs = require('fs');
    const {ObjectId} = require('mongodb');

    let user_functions = {
        findUserDetails : (user_details, callback)=> {
            let mongo_query = {
                "$match": {
                    name: user_details.name,
                    password: user_details.password
                }
            };
            MONGO.getResultsWithAggregation('dishathon', 'sellers', mongo_query, (docs, error)=>{
                callback(docs[0]);
            });
        },
        updateInventoryIntoDb : (company_name, file_path, callback)=> {
            let insertDataIntoDb = (mongo_insert_query)=>{
                return new Promise((revolve, reject)=> {
                    MONGO.insertValuesIntoDb('dishathon', 'fashion_inventory', mongo_insert_query, (success_status)=>{
                        revolve(success_status);
                    });
                });
            };
            let extract_dirname = __dirname.split('/');
            extract_dirname.pop();
            let actual_dirname = extract_dirname.join('/')+"/public/inventory/"+file_path;

            let csvData=[];
            fs.createReadStream(actual_dirname)
                .pipe(csv_parse({delimiter: ','}))
                .on('data', function(csvrow) {
                    try {
                        let obj = {
                            company_name : company_name,
                            category: csvrow[0],
                            gender: csvrow[1],
                            item_id: csvrow[2],
                            product_link: csvrow[3],
                            price: parseInt(csvrow[4]),
                            colour: csvrow[5],
                            pattern: csvrow[6],
                            pattern_type: csvrow[7],
                            sleeve: csvrow[8],
                            sleeve_type: csvrow[9],
                            neck: csvrow[10],
                            image_link_default: csvrow[11],
                            image_link_front: csvrow[12],
                            image_link_back: csvrow[13],
                            image_link_left: csvrow[14],
                            image_link_right: csvrow[15],
                            clicks : 0,
                            impressions : 0,
                            max_cpc : 0
                        };
                        csvData.push(insertDataIntoDb(obj));
                    }catch(e){}
                })
                .on('end',function() {
                    Promise.all(csvData).then((result)=> {
                        callback(result);
                    });
                });
        },
        getProductList : (company_name, callback)=> {
            let mongo_query = [{"$match":{"company_name" : company_name}},{"$limit":50}];
            // console.log(mongo_query);
            MONGO.getResultsWithAggregation('dishathon', 'fashion_inventory', mongo_query, (docs, error)=> {
                console.log("Inventory length : ",docs.length);
                let result = docs.map((doc)=>{
                    let obj = {
                        item_id : doc['item_id'],
                        product_link : doc['product_link'],
                        price : doc['price'],
                        max_cpc : doc['max_cpc'],
                        clicks : doc['clicks'],
                        impressions : doc['impressions']
                    };
                    return obj;
                });
                callback(result);
            });
        },
        updateProductCpcValue : (content, callback)=> {
            let product_id = content['product_id'];
            let cpc_value = content['cpc_value'];
            if (!ObjectId.isValid(product_id)) {
                return Promise.reject(new TypeError(`Invalid id: ${id}`));
            }
            let mongo_query = {"_id" : ObjectId(product_id)};
            let update_query = {"$set" : {"max_cpc" : parseFloat(cpc_value)}};
            console.log(mongo_query, update_query);
            MONGO.updateValuesIntoDb('dishathon', 'fashion_inventory', mongo_query, update_query, (success_status)=>{
                console.log(success_status);
                callback(success_status);
            });
        }
    };
    return user_functions;
})();