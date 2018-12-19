let json2csv  = require('json2csv').parse;
let fs = require('fs');

let MONGO = require('./mongo-queries.js');
let product_query = {
    "product_filter.website" : "myntra"
};
let required_data = [];
let fields = ['category', 'item_id', 'product_link', 'price', 'colour', 'pattern', 'pattern_type', 'sleeve', 'sleeve_type', 'neck', 'image_link_default', 'image_link_front', 'image_link_back', 'image_link_left', 'image_link_right'];
setTimeout(function(){
    console.log("Inside timeout function");
    MONGO.getResultsWithLimit('product_data', 'women_tops', product_query, 0, (docs, error)=>{
        docs.forEach((doc, idx)=> {
            try {
                let obj = {
                    category: 'tops',
                    gender: 'women',
                    item_id: idx + 1,
                    product_link: doc['pdpData']["landingPageUrl"],
                    price: doc['product_filter']['price'],
                    colour: doc['product_filter']['colour'],
                    pattern: doc['product_filter']['pattern'],
                    pattern_type: doc['product_filter']['pattern_type'],
                    sleeve: doc['product_filter']['sleeve'],
                    sleeve_type: doc['product_filter']['sleeve_type'],
                    neck: doc['product_filter']['neck'],
                    image_link_default: doc['style_images']['default']['imageURL'],
                    image_link_front: doc['style_images']['front']['imageURL'],
                    image_link_back: doc['style_images']['back']['imageURL'],
                    image_link_left: doc['style_images']['left']['imageURL'],
                    image_link_right: doc['style_images']['right']['imageURL']
                };
                required_data.push(obj);
            }catch(e){}
        });
        const csv = json2csv(required_data, fields);
        fs.writeFile('sample_inventory_file1.csv', csv, function(err) {
            if (err) throw err;
            console.log('file saved');
        });
    });
}, 5000);