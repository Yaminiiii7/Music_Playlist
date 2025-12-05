import {verify} from '../util/auth.js';
import User from '../models/user.js';

const verifyUser=async (req,res,next)=>{
    const {authorization}=req.headers;

    try{
        if(!authorization){
            return res.status(401).json({error:'No token provided'});
        }

        const [token_type,token]=authorization.split(' ');

        if(token_type!=='Bearer'||!token){
            return res.status(401).json({error:'Invalid token format'});
        }
        //verify the token and get decoded payload
        //decoded payload:{username,_id}
        const verified=verify(token);
        if(!verified){
            return res.status(401).json({error:'Token is invalid or expired'});
        }

        const user=await User.findOne({'_id':verified._id});
        if(!user){
            return res.status(401).json({error:'User not found'});
        }
        //attach user object to request for next route handler
        req.user=user;
        //pass control to the next middleware or route handler
        next();

    }catch(error){
        console.log(error);
        res.status(500).json({error:'Failed to verify user'});
    }



};

export {verifyUser};