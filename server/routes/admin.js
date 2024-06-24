const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;
const adminLayout = '../views/layouts/admin';

// Auth middleware
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if(!token) {
        return res.status(401).json( { message: 'Acesso restrito' } );
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json( { message: 'Acesso restrito'} );
    }
}

// Login page
router.get('/admin', async (req, res) => {
    try {
        const locals = {
            title: 'Administrador',
            description: "RECIFRAN"
        }

        res.render('admin/index', {locals, layout: adminLayout});
    } catch (error) {
        console.log(error)
    }
});

// Login Check
router.post('/admin', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await User.findOne( { username } );

        if(!user) {
            return res.status(401).json({message: 'Credenciais inválidas.'});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid) {
            return res.status(401).json({message: 'Credenciais inválidas.'});
        }
        const token = jwt.sign({ userId: user._id}, jwtSecret );
        res.cookie('token', token, {httpOnly: true});
        res.redirect('/dashboard');

    } catch (error) {
        console.log(error);
    }
});

// admin dashboard

router.get('/dashboard', authMiddleware, async (req, res) => {
    
    try {
        const locals = {
            title: 'Dashboard',
            description: 'RECIFRAN'
        }

        const data = await Post.find();
        res.render('admin/dashboard', {
            locals,
            data,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error);
    }
});

// admin create new get

router.get('/add-post', authMiddleware, async (req, res) => {
    
    try {
        const locals = {
            title: 'Nova Postagem',
            description: 'RECIFRAN'
        }

        const data = await Post.find();
        res.render('admin/add-post', {
            locals,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error);
    }
});

// admin create new post

router.post('/add-post', authMiddleware, async (req, res) => {
    try {
        const newPost = new Post({
            title: req.body.title,
            body: req.body.body
        });
        await Post.create(newPost);
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
});

// edit-post-get

router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        
        const locals = {
            title: 'Editar Postagem',
            description: 'RECIFRAN'
        }

        const data = await Post.findOne({ _id: req.params.id });

        res.render('admin/edit-post', {
            locals,
            data,
            layout: adminLayout
        });
      
    } catch (error) {
        console.log(error);
    }
});


// edit-post-put

router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        });

        res.redirect(`/edit-post/${req.params.id}`);

      
    } catch (error) {
        console.log(error);
    }
});


// delete 

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {

try {
    await Post.deleteOne({ _id: req.params.id });
    res.redirect('/dashboard');
} catch (error) {
    console.log(error);
}

});

// Get Admin Logout

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});


module.exports = router;