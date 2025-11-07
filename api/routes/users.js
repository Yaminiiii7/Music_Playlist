import express from 'express';

import {User} from '../db/mock_db.js';
import {hash,compare,sign} from '../util/auth.js';
import {verifyUser} from '../middleware/authorization.js';

const router=express.Router();

const _sanitize=(user)=>{
    const {password,...rest}=user
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

        const existing=User.find('username',username.toLowerCase());
        if (existing){
             return res.status(400).json({error:'Username already exists'})
        }
        const hashed=await hash(password)

        const registeredUser=User.add({username:username.toLowerCase(),password:hashed,registrationDate: new Date().toISOString()});

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

        const user = User.find('username', username.toLowerCase());
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
            user: _sanitize({username,password})
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
        
        //console.log(id);
        // if (!userId|| userId !== parseInt(id)) {
        //     return res.status(403).json({ error: 'Forbidden: You are not authorized to view this user' });
        // }

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