let MONGO = require('./mongo-queries.js');

let mode = (array)=> {
    if(array.length == 0)
        return null;
    let modeMap = {};
    let maxEl = array[0], maxCount = 1;
    for(let i = 0; i < array.length; i++) {
        let el = array[i];
        if(modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;
        if(modeMap[el] > maxCount) {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
};
let get_object_boxes = (object_id)=>{
    return new Promise((revolve, reject)=>{
        let mongo_query = { "$match": { "object_id" : object_id } };
        MONGO.getResultsWithAggregation('dishathon', 'boxes', mongo_query, (docs, error)=> {
            let attr_object = {};
            docs.forEach((doc)=> {
                let attributes = doc['attributes'];
                console.log(attributes);
                try {
                    Object.keys(attributes).forEach((key) => {
                        if (!attr_object.hasOwnProperty(key))
                            attr_object[key] = [];
                        if(key=='colour')
                            attr_object[key] = attr_object[key].concat(attributes[key]);
                        else
                            attr_object[key].push(attributes[key]);
                    });
                }catch(e){}
            });
            let required_object = {};
            Object.keys(attr_object).forEach((key)=>{
                required_object[key] = mode(attr_object[key]);
            });
            revolve({"object_id" : object_id, "attributes" : required_object});
        });
    });
};
let update_attributes = (mongo_query, update_query)=> {
    return new Promise((revolve, reject)=>{
        MONGO.updateValuesIntoDb('dishathon', 'objects', mongo_query, update_query, (success)=>{
            revolve(success)
        });
    });
};
setTimeout(()=>{
    let get_objects_query = {"$match":{"video_id" :"polka"}};
    MONGO.getResultsWithAggregation('dishathon', 'objects', get_objects_query, (docs, error)=> {
        let respose_obj = [];
        let box_promises = docs.map((doc)=> {
            return get_object_boxes(doc['object_id']);
        });
        Promise.all(box_promises).then((all_objects)=>{
            // console.log(all_objects);
            let upd_promises = all_objects.map((object)=>{
                let find_query = {"object_id" : object['object_id']};
                // let attributes = {
                //     'sleeve_type': object['attributes']['sleeve type'],
                //     'pattern_type': object['attributes']['pattern type'],
                //     'pattern': object['attributes']['pattern'],
                //     'sleeve': object['attributes']['sleeve length'],
                //     'neck': object['attributes']['neck'],
                //     'tops_length': object['attributes']['tops length']
                // };
                let update_query = {"$set" : {"attributes" : object['attributes']}};
                return update_attributes(find_query, update_query);
            });
            Promise.all(upd_promises).then((success)=>{
                console.log(success)
            });
        });
    });
}, 2000);