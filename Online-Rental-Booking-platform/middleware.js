    const Listing =require("./models/listing");
    const Review =require("./models/review");
    const  ExpressError=require("./utils/ExpressError.js");
    const {listingSchema}=require("./schema.js");
    const {reviewSchema}=require("./schema.js");
    module.exports.isLoggedin=(req,res,next)=>{
        // console.log(req.path,"..",req.originalUrl);//original url stores complete path information so we store it so that if user want to add or 
        //edit information without login after login he will successfully redirect to this page
        
        if(!req.isAuthenticated()){
            req.session.redirectUrl=req.originalUrl;
            req.flash("error","you must have to logged in before creating a listing!")
            return res.redirect("/login");
        }
        next();
    };
    module.exports.saveRedirectUrl=(req,res,next)=>{
        if(req.session.redirectUrl){
            res.locals.redirectUrl=req.session.redirectUrl;//saving url to locals as by logging in the password defaultly resets req.session value so we save in locals which cannot be deleted
        }
        next();
    }

    module.exports.isOwner=async(req,res,next)=>{
        let{id}=req.params;
        let listing =await Listing.findById(id);
        //implementation of authorization
        if( !listing.owner.equals(res.locals.currUser._id)){
            req.flash("error","You are not the owner of listing");
            return res.redirect(`/listings/${id}`);
        }
        next();
    };
    module.exports.validateListing=(req,res,next)=>{
        let {error}= listingSchema.validate(req.body);//to validate schema of all fields on server side
        if(error){
            let errMsg=error.details.map((el)=>el.message).join(",");//to join all the error messages 
            throw new ExpressError(400,errMsg);
        }
        else{
            next();
        }
    };

    module.exports.validateReview=(req,res,next)=>{
        let {error}= reviewSchema.validate(req.body);//to validate schema of all fields on server side
        if(error){
            let errMsg=error.details.map((el)=>el.message).join(",");//to join all the error messages 
            throw new ExpressError(400,errMsg);
        }
        else{
            next();
        }
    };

    module.exports.isReviewAuthor=async(req,res,next)=>{
        let{id,reviewId}=req.params;
        let review =await Review.findById(reviewId);
        //implementation of authorization
        if( !review.author.equals(res.locals.currUser._id)){
            req.flash("error","You are not the author of this review");
            return res.redirect(`/listings/${id}`);
        }
        next();
    };