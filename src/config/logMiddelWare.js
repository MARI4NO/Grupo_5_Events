function log(req,res,next){
    if(req.session.usuario!=undefined){
        next()
    }else{
        res.redirect("/login")
    }
}
module.exports= log