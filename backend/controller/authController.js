const Joi = require('joi')
const User = require('../models/user')
const bcryptjs = require('bcryptjs')
const UserDTO = require('../dto/user')
const JWTService = require('../services/JWTService')
const RefreshToken = require('../models/tokens');
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;
const authController = {

    async register(req,res,next){
        // 1. validate user input 
    
        const userRegisterValidateSchema = Joi.object({
            username: Joi.string().min(3).max(40).required(),
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().required().pattern(passwordPattern),
            confirmPassword: Joi.ref('password')
        });
        
        // 2. if validation error occur they give error by using middleware 
        const {error} = userRegisterValidateSchema.validate(req.body)

        if(error){
            return next(error)
        }

        // 3. if email or username exists -> return error via middleware

        const {username,name,email,password} = req.body;

        const emailExist = await User.exists({email});
        const usernameUsed = await User.exists({username})

        if(emailExist){
            const error = {
                status: 409,
                message: "Email already exist, use another email"
            }

            return next(error)
        }

        if(usernameUsed){
            const error = {
                status: 409,
                message: "Username already taken, choose another username"
            };

            return next(error);
        }

        // 4. password hashing using bycryptjs pakage

        const hashedPassword = await bcryptjs.hash(password,10);

        let user;
        // 5. Save into database 
        try{
            user = new User({
                username, //if your key and value have the same name you can use at one time 
                name,
                email:email,
                password:hashedPassword,
            })
    
            await user.save();
      
        }
        catch(error){
            return next(error);
        }

        // Generate Tokens
        const accessToken = JWTService.signAccessToken({_id: user._id},"30m");
        const refreshToken = JWTService.signRefreshToken({_id: user._id},"30m");

        // store refreshToken in database
        try{
            await JWTService.storeRefreshToken(refreshToken,user._id);
        }
        catch(error){
            console.log(error)
        }
        
        // store tokens in cookie
        res.cookie("accessToken",accessToken,{
            maxAge: 1000 * 60 * 60 * 24 ,
            httpOnly: true   //prevent from XSS attack
        })

        res.cookie('refreshToken',refreshToken,{
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        })

        const userDto = new UserDTO(user)
        return res.status(200).json({user: userDto})  // used only user in json() using shorthand notation 

    },


    async login(req,res,next){

        const userLoginValidateSchema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required()
        });

        const {error} = userLoginValidateSchema.validate(req.body)

        if(error){
            return next(error)
        }

        const {email,password} = req.body;

        let user;
        try{
            // find user in database
            user = await User.findOne({email: email})
            if(!user){
                const error = {
                    status: 401,
                    message: "Invalid Email"
                }
                return next(error)
            }

            const matchPass = await bcryptjs.compare(password,user.password);

            if(!matchPass){
                const error = {
                    status: 401,
                    message: "Invalid Password"
                }
                return next(error)
            }

        }
        catch(error){
            return next(error)
        }     
        
        // generate tokens 
        const accessToken = JWTService.signAccessToken({_id: user._id},"30m");
        const refreshToken = JWTService.signRefreshToken({_id: user._id},"30m");

        // update tokens in database 
        try{
            await RefreshToken.updateOne({
                _id: user._id
            },{
                token: refreshToken
            },{
                upsert: true
            })
        }
        catch(error){
            console.log(error)
        }
        // store token in coookie client side 
        res.cookie("accessToken",accessToken,{
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        })

        res.cookie("refreshToken",refreshToken,{
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        })
        
        // response using DTO(Data Transfer Objects)
        const userDto = new UserDTO(user);
        return res.status(200).json({user: userDto})
        
    },

    logout(req,res,next){
        // delete refreshToken from database
        const {refreshToken} = req.cookies;
        try {
            RefreshToken.deleteOne({token: refreshToken})            
        } catch (error) {
            return next(error)
        } 
        // delete refreshToken from cookie 
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        // sent response 
        return res.status(200).json({user:null,auth:false})

    },

    async refresh(req,res,next){
        // get refreshToken from cookies 
        // verify refresh token
        // generate new token 
        // update db token and return response
        
        // get refreshToken from cookies
        const originalRefreshToken = req.cookies.refreshToken;
        
        // verify refresh token
        let _id;
        try {
            _id = await JWTService.verifyRefreshToken(originalRefreshToken)._id
            
        } catch (e) {
            const error = {
                status: 401,
                message: "Unathorized!"
            }
            return next(error)
        }

        try {
            const match = RefreshToken.findOne({_id:_id,token:originalRefreshToken});

            if(!match)
            {
                const error = {
                    status: 401,
                    message: "Unathorized!"
                }
                return next(error);
            }
        } 
        catch (error) {
            return next(error)
        }


        // generate new tokens 
        try {
            const newAccessToken = JWTService.signAccessToken({_id:_id},"30m");
            const newRefreshToken = JWTService.signRefreshToken({_id:_id},"30m");
            
            // update tokens and return response
            try {
                await RefreshToken.updateOne({userId:_id},{token:newRefreshToken})
                
                // update tokens from cookie
                res.cookie('accessToken',newAccessToken,{
                    maxAge: 1000 * 60 * 60 * 24,
                    httpOnly: true
                })
                res.cookie("refreshToken",newRefreshToken,{
                    maxAge: 1000 * 60 * 60 * 24,
                    httpOnly:true
                })

                
            } catch (error) {
                return next(error)
            }

        } catch (error) {
            return next(error)
        }

        const user =  await User.findOne({_id});

        const userDto = new UserDTO(user);

        return res.status(200).json({user: userDto,auth:true});

    }

}

module.exports = authController