module.exports = (function () {
    const MONGO = require('../config/mongo-queries');

    let user_functions = {
        findUserDetails : (user_details, callback)=> {
            let mongo_query = {
                "$match":{
                    name: user_details.name,
                    password: user_details.password
                }
            };
            MONGO.getResultsWithAggregation('dishathon', 'dish_admins', mongo_query, (docs, error)=>{
                callback(docs[0]);
            });
        },
        getProductBiddings : (callback)=> {
            let mongo_query = {"$match":{}};
            MONGO.getResultsWithAggregation('dishathon', 'fashion_inventory', mongo_query, (docs, error)=> {
                console.log("Inventory length : ",docs.length);
                let result = docs.map((doc)=> {
                    let clicks = doc['clicks'];
                    let impressions = doc['impressions'];
                    let click_by_impression_ratio = (clicks/impressions);
                    let obj = {
                        company_name : doc['company_name'],
                        item_id : doc['item_id'],
                        price : doc['price'],
                        product_link : doc['product_link'],
                        max_cpc : doc['max_cpc'],
                        clicks : clicks,
                        impressions : impressions,
                        click_by_impression_ratio : (click_by_impression_ratio?click_by_impression_ratio:0)
                    };
                    return obj;
                });
                callback(result);
            });
        },
        updateVideoDatabase : (video_name, video_path, callback)=> {
            let video_details_query = {
                name : video_name,
                thumbnail_path : '',
                video_path : video_path,
                processing_status : true
            };
            MONGO.insertValuesIntoDb('dishathon', 'video_details', video_details_query, ()=>{
                callback();
            });
        }
    };
    return user_functions;
})();