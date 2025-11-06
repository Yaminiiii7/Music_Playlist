import express from 'express';

import {User} from '../db/mock_db.js';

const router=express.Router();

const _sanitize=(user)=>{
    const {password,...rest}=user
    return rest;
};

router.post('/register', async (req, res) => {
    try{
        const {username,password}=req.body;

        if(!username||!password){
            return res.status(400).json({error:'Username and password required to register.'});
        }

        const existing=User.find('username',username.toLowerCase());
        if (existing){
             return res.status(400).json({error:'Username already exists'})
        }

        const registeredUser=User.add({username:username.toLowerCase(),password,registrationDate: new Date().toISOString()});

        res.status(201).json(_sanitize(registeredUser));

    }catch(err){
        console.log(err);
        res.status(500).json({error:'failed to register user'});
    }
});

router.post('/login', async (req, res) => {
    try{
        const {username,password}=req.body;

        const user = User.find('username', username.toLowerCase());
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        res.json(_sanitize({username,password}));

    }catch(err){
        console.log(err);
        res.status(500).json({error:'failed to login user'});
    }
});

router.get('/:id', async (req, res) => {
    try {
        
        const { id } = req.params;
        const userId= req.headers.authorization;
        

        if (!userId || userId !== id) {
            return res.status(403).json({ error: 'Forbidden: You are not authorization to view this user' });
        }

        const user=User.find('_id',parseInt(id));
        if(!user){
            return res.status(404).json({error:'User not found'});
        }

        return res.json(_sanitize(user));
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to get user' });
    }
});



export default router