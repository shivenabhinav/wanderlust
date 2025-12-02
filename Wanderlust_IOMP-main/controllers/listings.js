const Listing=require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index=async(req,res)=>{
    const alllistings= await Listing.find({});
    res.render("listings/index",{alllistings});
 }

 module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
 }

 module.exports.showlisting=async(req,res)=>{
    let{id}=req.params;
    const listing=await Listing.findById(id).populate(
       {path:"reviews",
           populate:{
               path:"author",
           },
       })
       .populate("owner");
    if(!listing){
       req.flash("error","Listing you requested for does not exist!");
       return res.redirect("/listings");
    }
   //  console.log(listing);
    res.render("listings/show.ejs",{listing});
}

module.exports.createListing = async (req, res, next) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    }).send();
    
   

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    
    // Assign owner
    newListing.owner = req.user._id;
    
    // Assign image
    newListing.image = { url, filename };
    
    // Assign geometry (coordinates from geocoding response)
    newListing.geometry = response.body.features[0].geometry;
    
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};


module.exports.renderEditForm=async(req,res)=>{
    let{id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
     }
     let originalImageUrl=listing.image.url;
    originalImageUrl= originalImageUrl.replace("/upload","/upload/w_250");//to make images blur or reducing pixels
    res.render("listings/edit.ejs",{listing,originalImageUrl});
}

module.exports.updateListing=async(req,res)=>{
    
    let{id}=req.params;   
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});//req.body.listing is a javascript object which has value by writing this line we can deconstruct all the parameters into individual lines which are passed to newly updated values
    if(typeof req.file!="undefined"){
        let url=req.file.path;//from here in next 3 steps we are updating the image
   let filename=req.file.filename;
   listing.image={url,filename};
   await listing.save();
    }
    
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing=async(req,res)=>{
    let{id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success"," Listing Deleted!");
    res.redirect("/listings");
}