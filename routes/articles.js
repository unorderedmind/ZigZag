const express = require('express');
const router = express.Router();

//********* DB Models *********
const Article = require('../models/articles');
const User = require('../models/user');

// *********** Get Home Route ***********
router.get('/', (req, res)=>{
    Article.find({}, (err, articles)=>{
        if(err){console.log(err); }
        else{ res.render('index', {title: 'Articles', articles: articles}); }
    });
});

// *********** Get Individual Article by id ***********
router.get('/article/:id', (req, res)=>{
    if(req.user){
            const id = req.params.id;
            Article.findById(id, (err, article)=>{
                if(!article){console.log('Article not found');  res.redirect('/'); }
                else{
                    User.findById(article.author, (err, user)=>{
                    if(!user){console.log('User not found');  res.redirect('/'); }
                    else{ res.render('article', {article: article, author: user.name}); }
            });
        }
    });
    }else{
        res.redirect('/');
    }
});

// *********** Add Route ***********
router.get('/articles/add', ensureAuthenticated, (req, res)=>{
    res.render('add-article', {title: 'Add Article'});
});


// *********** Add Article Route ***********
router.post('/articles/add', ensureAuthenticated, (req, res)=>{
    // express validator
    req.checkBody('title', 'Title is required.').notEmpty();
    req.checkBody('body', 'Body is required.').notEmpty();

    // Get the errors
    let errors = req.validationErrors();
    if(errors){
        console.log(errors);
        res.render('add-article', {title: 'Add Article', errors: errors});
    }else{
        const article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;

        article.save((err)=>{
            if(err){  
                req.flash('error', 'Error Adding Article');
                console.log(err);   
                res.redirect('/articles/add');
            } else{ 
                req.flash('success', 'Article Added');
                res.redirect('/'); 
            }
        });
    }
});

/* Add to template:
*    <% if (typeof errors !== 'undefined'){ errors.forEach((error)=>{ %>
*        <p><%= error.msg %></p>
*    <% }) } %>
*/        



// *********** Get Update Article Page ***********
router.get('/article/edit/:id', ensureAuthenticated, (req, res)=>{
    const id = req.params.id;
    Article.findById(id, (err, article)=>{
        if(article.author != req.user._id){
            req.flash('danger', 'Not Authorized');
            res.redirect('/');
        }else{
            if(err){console.log(err);  res.redirect('/'); }
            else{ res.render('edit-article', {article: article}); }
        }
    });
});

// *********** Post Update Article ***********
router.post('/article/edit/:id', ensureAuthenticated, (req, res)=>{
    const id = req.params.id;

    const article = {};
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    Article.update({_id: id}, article, (err)=>{
        if(err){ console.log('/');   res.redirect('/');}
        else{ res.redirect('/'); }
    });
});


// *********** Delete Article ***********
router.delete('/article/:id', ensureAuthenticated, (req, res)=>{
    if(!req.user._id){
        res.status(500).send();
    }

    Article.findById(req.params.id, (err, article)=>{
        if(article.author != req.user._id){
           res.status(500).send(); 
        }else{
            Article.remove({_id: req.params.id}, (err)=>{
                if(err){console.log(err);  res.redirect('/'); }
                else{ res.send('Success'); }
            });
        }
    });
}); 


// *********** Access Control ***********
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){ return next();
    }else{
        req.flash('danger', 'Please Login!');
        res.redirect('/users/login');
    }
}


// *********** Export Router ***********
module.exports = router;