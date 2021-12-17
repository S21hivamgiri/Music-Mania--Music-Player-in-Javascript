var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
let md5 = require('md5')
var bcrypt = require('bcryptjs');
var User = require('../model/user.model');
var Role = require('../model/role.model');

router.post('/signup', function (req, res) {
    var body = req.body;
    var obj = new User(body);
    let salt = bcrypt.genSaltSync(10);
    obj['password'] = bcrypt.hashSync(md5(obj['password']), salt);

    User.find({
        email: obj.email
    }, (error, emailData) => {
        if (emailData && emailData.length) {
            return res.json({
                success: false,
                message: 'User Already Registered'
            });
        }

        Role.findOne({
            name: 'User'
        }).exec(
            function (err, data) {
                if (err) {
                    return res.send(err);
                }
                obj.roles = [];
                obj.playlist = [];
                obj.loginTime = new Date();
                obj.initials = obj.firstName.charAt(0);
                const id = mongoose.Types.ObjectId(data._id);
                obj.roles.push(id);
                obj.save(function (err) {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: 'Unable to create User',
                            error: err
                        });
                    }
                    return res.status(201).json({
                        success: true,
                        message: 'User created Successfully'
                    });
                });
            });
    });
});

router.post('/login', function (req, res) {
    let salt = bcrypt.genSaltSync(10);
    let password = bcrypt.hashSync(md5(req.body.password), salt);
    User.findOne({
        email: req.body.email
    }).populate('roles').exec(function (err, loginData) {
            if (err) {
                res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err);
            }
            if (loginData) {
                let roles = [];
                const validPassword = bcrypt.compare(password, loginData.password);
                if (validPassword) {
                    for (let i = 0; i < loginData.roles.length; i++) {
                        roles.push(loginData.roles[i].firstName);
                    }
                    const authObj = {
                        userId: loginData._id,
                        firstName: loginData.firstName,
                        lastName: loginData.lastName,
                        loginTime: loginData.loginTime,
                        contact: loginData.contact,
                        initials: loginData.initials,
                        roles: roles,
                        email: req.body.email,
                        playlist: req.body.playlist
                    };
                    User.findByIdAndUpdate(authObj.userId, { loginTime: new Date() });
                    res.json({
                        success: true,
                        user: authObj
                    });
                    return;
                }

                res.status(500).json({
                    success: false,
                    message: 'Authentication failed. Not Entitled for the access.'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Authentication failed.  Login Unsuccessful'
                });
            }
        });
});



module.exports = router;