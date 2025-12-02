const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedin, isOwner, validateListing } = require("../middleware.js");
const listingcontroller = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// 🟢 New Listing Form
router.get("/new", isLoggedin, listingcontroller.renderNewForm);

// 🟢 Index + Category Filter + Create Listing
router
  .route("/")
  // Filter listings by category using query ?category=Farms
  .get(
    wrapAsync(async (req, res) => {
      const { category, sort } = req.query;
      let filter = {};
      let sortOption = {};

      // Filter by category (if provided and not 'All')
      if (category && category !== "All") {
        filter.category = category;
      }

      // Sort by price
      if (sort === "low") {
        sortOption.price = 1; // ascending
      } else if (sort === "high") {
        sortOption.price = -1; // descending
      }

      // Fetch listings with filter and sorting
      const alllistings = await Listing.find(filter).sort(sortOption);

      res.render("listings/index", {
        alllistings,
        success: req.flash("success"),
        category,
        sort,
      });
  }))
      .post(
        isLoggedin,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingcontroller.createListing)
      );

// 🟢 Show / Edit / Update / Delete
router
  .route("/:id")
  .get(wrapAsync(listingcontroller.showlisting))
  .put(
    isLoggedin,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingcontroller.updateListing)
  )
  .delete(isLoggedin, isOwner, wrapAsync(listingcontroller.destroyListing));

// 🟢 Edit form route
router.get("/:id/edit", isLoggedin, isOwner, wrapAsync(listingcontroller.renderEditForm));

module.exports = router;
