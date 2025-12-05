import express from 'express';

import User from '../models/user.js';
import {hash,compare,sign} from '../util/auth.js';
import {verifyUser} from '../middleware/authorization.js';

const router=express.Router();

const _sanitize=(user)=>{
    const userObj=user.toObject?user.toObject():user;
    const {password, ...rest}=userObj;
    return rest;
};

/**
 * @route POST /users/register
 * @description Registers a new user with username, password 
 * @param {Object} req.body - the request body
 *
 * @returns {Object} 201 - user object (sanitized)
 */
router.post('/register', async (req, res) => {
    try{
        const {username,password}=req.body;

        if(!username||!password){
            return res.status(400).json({error:'Username and password required to register.'});
        }

        const existing=await User.findOne({'username':username.toLowerCase()});
        if (existing){
             return res.status(400).json({error:'Username already exists'})
        }
        const hashed=await hash(password)
        const registeredUser=await User.create({username:username.toLowerCase(),password:hashed,registrationDate: new Date().toISOString()});
        res.status(201).json(_sanitize(registeredUser));

    }catch(err){
        console.log(err);
        res.status(500).json({error:'failed to register user'});
    }
});

/**
 * @route POST /users/login
 * @description Login a user by validating username and password
 * @param {Object} req.body - the request body
 *
**/

router.post('/login', async (req, res) => {
    try{
        const {username,password}=req.body;

        const user = await User.findOne({'username':username.toLowerCase()});
        if (!user) {
            return res.status(401).json({ error: 'Invalid username' });
        }

        const isValid=await compare(password,user.password);
        if(!isValid){
            return res.status(401).json({error:'Invalid Password'});
        }
        //token
        const token=sign({username:user.username,_id:user._id})

        res.json({access_token: token,
            token_type: 'Bearer',
            user:_sanitize(user)
        });

    }catch(err){
        console.log(err);
        res.status(500).json({error:'failed to login user'});
    }
});

/**
 * @route GET /users/:id
 * @description Retrieves a private user profile by id. Requires authorization header to match user id.
 * @param {string} id - user id from the URL
 * @header {string} Authorization - "Bearer <token>"
 *
 * @returns {Object} 200 - user object (sanitized)
 */
router.get('/:id', verifyUser, async (req, res) => {
    try {
        
        const { id } = req.params;
        //const userId= req.headers.authorization;
        
        console.log(id);
        console.log(req.user._id.toString())
        if (req.user._id.toString()!=id) {
            return res.status(403).json({ error: 'Forbidden: You are not authorized to view this user' });
        }

        return res.json(_sanitize(req.user));
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

export default router