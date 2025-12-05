import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET=process.env.JWT_SECRET;

const hash=async (password)=>{
    const rounds=10;
    const salt=await bcrypt.genSalt(rounds);
    const hashed=await bcrypt.hash(password,salt);
    return hashed;
};

const compare=async(password,dbPassword)=>{
    return await bcrypt.compare(password,dbPassword);
};

const sign=(payload)=>{//returns token
    return jwt.sign(payload, JWT_SECRET, {expiresIn:'24h'});
};

const verify=(token)=>{//checks with jwt token with secretkey and expirydate
    try{
        //console.log(jwt.verify(token,JWT_SECRET))has a object that contain user details+expiry
        return jwt.verify(token,JWT_SECRET);

    }catch(error){
        return null;
    }


}

export {hash,compare,sign,verify};