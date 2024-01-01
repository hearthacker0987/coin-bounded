const Jwt = require('jsonwebtoken')
const {ACCESS_TOKEN_SECRET,REFRESH_TOKEN_SECRET} = require('../config/index')
const RefreshToken = require('../models/tokens')
class JWTService {

    // 1. sign access token 
    static signAccessToken(payload,expiryTime){
        return Jwt.sign(payload,ACCESS_TOKEN_SECRET,{expiresIn:expiryTime})
    }

    // 2. sign refresh token 
    static signRefreshToken(payload,expiryTime){
        return Jwt.sign(payload,REFRESH_TOKEN_SECRET,{expiresIn: expiryTime})
    }

    // 3. verify access token 
    static verifyAccessToken(token){
        return Jwt.verify(token,ACCESS_TOKEN_SECRET)
    }

    // 4. verify refresh token 
    static verifyRefreshToken(token){
        return Jwt.verify(token,REFRESH_TOKEN_SECRET)
    }

    // 5. store refresh token 
    static async storeRefreshToken (token,userId){
        try{
            const newToken = new RefreshToken({
                token: token,
                userId: userId
            })

            await newToken.save()
        }
        catch(error){
            console.log(error)
        }
    }
}

module.exports = JWTService