let express = require('express');
let router = express.Router();
let jwt = require('jsonwebtoken');
let multer = require('multer');
let path = require('path');

let storage = multer.diskStorage({
    destination : (req, file, callback)=>{
        callback(null, 'public/videos');
    },
    filename : (req, file, callback)=>{
        let filename = file.originalname;
        let extname = path.extname(filename);
        try{
            filename = filename.replace(extname, new Date().getTime())+extname;
            filename = filename.split(' ').join('-');
        }catch(e){console.log("Error in changing file format : ",e);}
        callback(null, filename);
    }
});
let upload = multer({
    storage : storage
});

const user_controller = require('../controllers/dish-controller');
let config = require('../config/conf');

router.post('/authenticate', (req, res, next)=>{
    let content = req.body;

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('password', 'password is required').notEmpty();

    let errors = req.validationErrors();
    if(errors){
        res.json({success : false, "message" : errors[0]['msg']});
    }
    else {
        user_controller.findUserDetails(content,(user)=>{
            if(!user) {
                res.json({success : false, message: "Authentication failed. Invalid credentials."});
            }
            else {
                const payload = {
                    name : user.name,
                    user_id : user._id
                };
                // let token = jwt.sign(payload, config.secret,{});
                res.json({
                    success : true,
                    message : 'Enjoy your token!',
                    user_details : payload
                });
            }
        });
    }
});
router.post('/upload-video', upload.single('video'), (req, res, next)=>{
    req.checkBody('video_name', 'Name is required').notEmpty();
    console.log(req.body);
    let errors = req.validationErrors();
    if(errors){
        res.json({success : false, "message" : errors[0]['msg']});
    }
    else {
        if (req.file) {
            let content = req.body;
            let video_name = content.video_name;
            let video_path = 'public/videos/'+req.file.filename;
            // let extname = path.extname(video_name);
            // video_name = video_name.split(extname).join('');
            // video_name = video_name+"-"+new Date().getTime();
            user_controller.updateVideoDatabase(video_name, video_path, ()=> {
                res.json({success: true, message: "Successfully uploaded"});
            });
        }
        else {
            res.json({success: true, message: "Got an error in file"});
        }
    }
});
router.post('/get-product-bidding', (req, res, next)=> {
    let decoded = req.body.user_details;
    console.log(decoded);
    let name = decoded.name;
    user_controller.getProductBiddings((result)=>{
        let response_obj = {
            data : result
        };
        res.json(response_obj);
    });
});
router.post('/get-campaigns', (req, res, next)=> {
    let result = [
        {
            from_date : 1529625600000,
            to_date : 1530316800000,
            company_name : 'myntra',
            campaign_name : 'myntra-campaign-1',
            clicks : 0,
            impressions : 0,
            click_by_impression_ratio : 0,
            value_score : 5
        }
    ];
    let response_obj = {
        data : result
    };
    res.json(response_obj);
});

module.exports = router;
