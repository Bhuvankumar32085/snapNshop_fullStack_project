module.exports.isloggen=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash('success','You Must Be LogIn')
        res.redirect('/user/createAccountForm')
    }
    next()
}