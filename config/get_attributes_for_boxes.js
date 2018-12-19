let request = require('request');

let MONGO = require('./mongo-queries.js');
let update_attribute_data = (mongo_query, update_query)=> {
    return new Promise((revolve, reject)=> {
        MONGO.updateValuesIntoDb('dishathon', 'boxes', mongo_query, update_query, (success_status)=> {
            revolve(success_status);
        });
    });
};
let getAllAttributes = (product_line, image_links, callback)=> {
    let options = {
        method: 'POST',
        url: 'https://imagetag.in/selekt-attribute/get-attributes',
        headers: {
            'content-type': 'application/json'
        },
        body: {
            product_line : product_line,
            image_links  : image_links
        },
        json: true
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        callback(JSON.parse(body));
    });
};
let product_query = {
    "$match" : {"video_id" : "polka"}
};
setTimeout(()=>{
    MONGO.getResultsWithAggregation('dishathon', 'boxes', product_query, (docs, error)=>{
        console.log("Docs length : ", docs.length);
        let image_links = docs.map((doc)=> {
            return doc['image_path'];
        });
        getAllAttributes("women_tops", image_links, (response)=> {
            console.log(JSON.stringify(response, null, 2));
            let all_images = Object.keys(response);
            let all_promises = [];
            all_images.forEach((img_link)=> {
                let mongo_query = {"image_path" : img_link};
                let colours = response[img_link]['colour'].hasOwnProperty('attribute_value')?response[img_link]['colour']['attribute_value'].map((att_value)=>{return att_value['colour']}):[];
                let update_query = {"colour" : colours};
                let remaining_attributes = ['sleeve_type', 'pattern_type', 'pattern', 'sleeve', 'neck', 'tops_length'];
                remaining_attributes.forEach((key)=>{
                    try {
                        update_query[key] = response[img_link][key]['attribute_value'];
                    }catch(e){}
                });
                all_promises.push(update_attribute_data(mongo_query, { "$set":{"attributes":update_query} }));
            });
            Promise.all(all_promises).then((status)=>{
                console.log(status);
            })
        });
    });
},2000);
