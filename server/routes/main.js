const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

//Routes
router.get('', async (req, res) => {
    
    
try {
    const locals = {
        title: "RECIFRAN",
        description: "Serviço Franciscano de Apoio à Reciclagem"
    }

    let perPage = 4;
    let page = req.query.page || 1;

    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec();

    const count = await Post.countDocuments();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render("index", {
        locals, 
        data,
        current: page,
        nextPage: hasNextPage? nextPage : null,
        currentRoute: '/'
    });


} catch (error) {
    console.log(error);
}

});

// Make a page and inject data

router.get('/post/:id', async (req, res) => {
    try {
        let slug = req.params.id;
        const data = await Post.findById({ _id: slug});
        
        const locals = {
            title: data.title,
            description: "RECIFRAN",
            
        }

        res.render('post', {locals, data, currentRoute: `/post/${slug}`});
    } catch (error) {
        console.log(error)
    }
});

// Make search

router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: 'Busca',
            description: "RECIFRAN"
        }

        let searchTerm = req.body.searchTerm;
        const searchNoSpecialCharacters = searchTerm.replace(/[^a-zA-z0-9]/g,"");

        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialCharacters, 'i') }},
                { body: { $regex: new RegExp(searchNoSpecialCharacters, 'i') }}
            ]
        });

        res.render('search', {locals, data});
    } catch (error) {
        console.log(error)
    }
});

// Rota sobre

router.get("/about", (req, res) => {
    res.render("about", {
        currentRoute:'/about'
    });
});

// Rota contato

router.get("/contact", (req, res) => {
    res.render("contact", {
        currentRoute:'/contact'
    });
});


module.exports = router;