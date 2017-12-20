const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const config = require('./database');
const bcrypt = require('bcryptjs');


module.exports = (passport)=>{
    passport.use(new LocalStrategy((username, password, done)=>{
        // match name
        User.findOne({username: username}, (err, user)=>{
            if(err) throw err;
            if(!user){
                return done(null, false, {message: 'No user found'});
            }
            // match password
            bcrypt.compare(password, user.password, (err, isMatch)=>{
                if(err) throw err;
                if(isMatch){
                    return done(null, user);
                }else{
                    return done(null, false, {message: 'Wrong Password'});
                }
            });
        });
    }));

    passport.serializeUser((user, done)=>{
        done(null, user.id);
    });

    passport.deserializeUser((id, done)=>{
        User.findById(id, (err, user)=>{
            done(err, user);
        });
    });
};
