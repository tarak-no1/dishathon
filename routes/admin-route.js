let express = require('express');
let router = express.Router();
let jwt = require('jsonwebtoken');

const user_controller = require('../controllers/admin-controller');
let config = require('../config/conf');

/* GET home page. */
router.post('/create-seller', function(req, res, next) {
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('password', 'password is required').notEmpty();

    let errors = req.validationErrors();
    if(errors){
        res.json({success : false, message : errors[0]['msg']});
    }
    else {
        let content = req.body;
        user_controller.createSeller(content, (status, message)=>{
            res.json({success: status, message : message});
        });
    }
});
router.post('/create-dish-admin', function(req, res, next) {
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('password', 'password is required').notEmpty();

    let errors = req.validationErrors();
    if(errors){
        res.json({success : false, message : errors[0]['msg']});
    }
    else {
        let content = req.body;
        user_controller.createDishAdmin(content, (status, message)=>{
            res.json({success: status, message : message});
        });
    }
});
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
                let token = jwt.sign(payload, config.secret,{});
                res.json({
                    success : true,
                    message : 'Enjoy your token!',
                    token : token
                });
            }
        });
    }
});
module.exports = router;
