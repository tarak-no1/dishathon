let express = require('express');
let router = express.Router();
let jwt = require('jsonwebtoken');
let multer = require('multer');
let path = require('path');

const user_controller = require('../controllers/seller-controller');
let config = require('../config/conf');

let storage = multer.diskStorage({
    destination : (req, file, callback)=>{
        callback(null, 'public/inventory');
    },
    filename : (req, file, callback)=>{
        let filename = file.originalname;
        let extname = path.extname(filename);
        try{
            filename = filename.replace(extname, new Date().getTime())+extname;
        }catch(e){console.log("Error in changing file format : ",e);}
        callback(null, filename);
    }
});
let upload = multer({
    storage : storage
});

router.post('/authenticate', (req, res, next)=>{
    let content = req.body;
    console.log(content);
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
                    token : '',
                    user_details : payload
                });
            }
        });
    }
});
router.post('/upload-inventory', upload.single('inventory'), (req, res, next)=>{
    let decoded = req.body.user_details;
    console.log("Decoded : ", decoded);
    let name = decoded.name;
    console.log(req.file);
    if (req.file) {
        let file_name = req.file.filename;
        user_controller.updateInventoryIntoDb(name, file_name, ()=>{
            res.json({success: true, message: 'Successfully uploaded'});
        });
    }
    else {
        res.json({success: false, message: "Got an error in file"});
    }
});
router.post('/get-product-list', (req, res, next)=>{
    let decoded = req.body.user_details;
    let name = decoded.name;
    // console.log("Name : ",name);
    user_controller.getProductList(name, (results)=>{
        let response_obj = {
            data : results
        };
        res.json(response_obj);
    });
});
router.post('/update-product-cpc-value', (req, res, next)=>{
    req.checkBody('product_id', 'product id is required').notEmpty();
    req.checkBody('cpc_value', 'cpc value is required').notEmpty();

    let decoded = req.body.user_details;
    let name = decoded.name;
    let content = req.body;
    console.log(content);
    let errors = req.validationErrors();
    if(errors){
        res.json({success : false, "message" : errors[0]['msg']});
    }
    else {
        user_controller.updateProductCpcValue(content, (status) => {
            res.json({success: true, message: 'successfully updated'});
        });
    }
});
router.post('/get-campain-budget', (req, res, next)=> {
    res.json({});
});

module.exports = router;
