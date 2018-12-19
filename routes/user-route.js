let express = require('express');
let router = express.Router();

let jwt = require('jsonwebtoken');
let config = require('../config/conf');
const user_controller = require('../controllers/user-controller');

router.post('/add-user', (req, res, next)=> {
    console.log('Inside add user api');
    req.checkBody('device_id', 'device id is required').notEmpty();
    let errors = req.validationErrors();
    if(errors){
        res.json({success : false, message : errors[0]['msg']});
    }
    else {
        let content = req.body;
        user_controller.createUserDetails(content.device_id, ()=>{
            const payload = {
                device_id : content.device_id
            };
            // let token = jwt.sign(payload, config.secret,{});
            res.json({
                success : true,
                message : 'Enjoy your token!',
                token : '',
                user_details : payload
            });
        });
    }
});
router.post('/get-object-boxes', (req, res, next)=>{
    console.log("inside get object boxes");
    req.checkBody('video_name', 'video name is required').notEmpty();
    req.checkBody('paused_position_time', 'Paused position time is required').notEmpty();

    let errors = req.validationErrors();
    if(errors){
        res.json({success : false, message : errors[0]['msg']});
    }
    else {
        let content = req.body;
        console.log(content);
        user_controller.getPositionBoxes(content, (boxes_result)=>{
            // boxes_result = [
            //     {
            //         object_id : 'fashion4',
            //         box_coordinates : [
            //             0.074980229139328,
            //             0.3455001711845398,
            //             1,
            //             0.8191625475883484
            //         ]
            //     },
            //     {
            //         object_id : 'fashion4',
            //         box_coordinates : [
            //             0.07532519102096558,
            //             0.34544575214385986,
            //             1,
            //             0.8209494352340698
            //         ]
            //     }
            // ];
            let response_obj = {
                success : true,
                message : "",
                data : boxes_result
            };
            res.json(response_obj);
        });
    }
});
router.post('/get-inventory', (req, res, next)=>{
    req.checkBody('object_id', 'object id is required').notEmpty();

    let errors = req.validationErrors();
    if(errors){
        res.json({success : false, message : errors[0]['msg']});
    }
    else {
        let content = req.body;
        user_controller.getInventory(content, (attributes, result, similar_images)=>{
            let response_obj = {
                attributes : attributes,
                data : result.splice(0,30),
                similar_images : similar_images,
                success : true
            };
            // if(result.length==0){
            //     response_obj = {success : false, message: 'No data found'};
            // }
            res.json(response_obj);
        });
    }
});
router.post('/save-favorite', (req, res, next)=>{
    req.checkBody('product_id', 'product id is required').notEmpty();
    let errors = req.validationErrors();
    if(errors){
        res.json({success : false, message : errors[0]['msg']});
    }
    else {
        let decoded = req.body.user_details;
        let device_id = decoded.device_id;
        let product_id = req.body.product_id;
        console.log(decoded);
        user_controller.storeFavorites(device_id, product_id, (success_status)=>{
            res.json({ success : true, message : "successfully added into favorites"});
        });
    }
});
router.post('/get-favorites', (req, res, next)=> {
    let decoded = req.body.user_details;
    let device_id = decoded.device_id;
    console.log(device_id);
    user_controller.getFavorites(device_id, (result)=> {
        let response_obj = {
            data : result
        };
        res.json(response_obj);
    });
});
module.exports = router;
