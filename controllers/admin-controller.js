module.exports = (function () {
    const MONGO = require('../config/mongo-queries');

    let user_functions = {
        createSeller : (seller_data, callback)=> {
            let mongo_query = {
                name : seller_data.name,
                password : seller_data.password
            };
            MONGO.getResults('dishathon', 'sellers', {"name" : seller_data.name}, (docs, error)=>{
                if(docs.length>0){
                    callback(false, "Username already existed");
                }
                else {
                    MONGO.insertValuesIntoDb('dishathon', 'sellers', mongo_query, (success_status) => {
                        console.log("Insert status : ", success_status);
                        callback(success_status, "Successfully created");
                    });
                }
            });
        },
        createDishAdmin : (dish_admin_data, callback)=> {
            let mongo_query = {
                name : dish_admin_data.name,
                password : dish_admin_data.password
            };
            MONGO.getResults('dishathon', 'dish_admins', {"name" : dish_admin_data.name}, (docs, error)=>{
                if(docs.length>0){
                    callback(false, "Username already existed");
                }
                else {
                    MONGO.insertValuesIntoDb('dishathon', 'dish_admins', mongo_query, (success_status)=>{
                        console.log("Insert status : ",success_status);
                        callback(success_status, 'Successfully created');
                    });
                }
            });
        },
        findUserDetails : (user_details, callback)=> {
            let mongo_query = {
                name: user_details.name,
                password: user_details.password
            };
            MONGO.getResults('dishathon', 'admin', mongo_query, (docs, error)=>{
                callback(docs[0]);
            });
        }
    };
    return user_functions;
})();