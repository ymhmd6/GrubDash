const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

//////////// VALIDATION HANDLERS ////////////

//middleware to check if the dish has a name.
//needed in order to move onto 'create()' and 'update()'.
function bodyHasName(req, res, next) {
    // deconstruct name from request body.
    const { data: { name } = {} } = req.body
    // if dish has a name, move request onto next function.
    if (name) {
        res.locals.name = name
        return next()
    } else {
        // if no name, stop executing and return object 
        // with error 'status' code and message.
        next({
            status: 400,
            message: `A 'name' property is required.`,
        })
    }
}


//middleware to check if dish has description.
//needed in order to move onto 'create()' and 'update()'.
function bodyHasDescription(req, res, next) {
    // deconstruct description from request body.
    const { data: { description } = {} } = req.body
    // if description, move request to next function
    if (description) {
        res.locals.description = description
        return next()
    } else {
        next({
            status: 400,
            message: `A 'description' property is required.`,
        })
    }
}


//middleware to check if the dish has a price.
//needed in order to move onto 'create()' and 'update()'.
function bodyHasPrice(req, res, next) {
    //decronstruct price from request body.
    const { data: { price } = {} } = req.body
    // if no price, move request to next function
    if (price) {
        res.locals.price = price
        return next()
    } else {
        //if no price, return error status code with message
        next({
            status: 400,
            message: `A 'price' property is required.`,
        })
    }
}


//middleware to check if dish price provided is valid.
//needed to move onto 'create()'
function bodyHasValidPrice(req, res, next) {
    //decronstruct price from request body.
    const { data: { price } = {} } = req.body
    //if price is valid (price >= 0), move request to next function.
    if (price > -1) {
        res.locals.price = price
        return next()
    } else {
        //if invalid price, return error status code with message.
        next({
            status: 400,
            message: `price cannot be less than 0.`,
        })
    }
}

function bodyHasValidPriceForUpdate(req, res, next) {

    const { data: { price } = {} } = req.body

    if (res.locals.price <= 0 || typeof res.locals.price !== "number") {
        next({
            status: 400,
            message: `price must be an integer greater than $0.`,
        })
    } else {

        return next()
    }
}


function bodyHasImg(req, res, next) {

    const { data: { image_url } = {} } = req.body

    if (image_url) {
        res.locals.image_url = image_url
        return next()
    } else {
        next({
            status: 400,
            message: `An 'image_url' property is required.`
        })
    }
}



function dishExists(req, res, next) {
    const { dishId } = req.params
    // create a variable for the dish that matches the dish's id
    const matchingDish = dishes.find((dish) => dish.id === dishId)
    // if there is a matching dish, move onto the next function
    if (matchingDish) {
      res.locals.matchingDish = matchingDish
      // console.log("res locals =>",res.locals, "<=")
      return next()
    }
    // otherwise, return the following message
    next({
      status: 404,
      message: `Dish id not found: ${dishId}`,
    })
}


// middleware for checking if the data id matches it's parameters id
// in order to move onto 'update' handler
function dishIdMatchesDataId(req, res, next) {
    const { data: { id } = {} } = req.body
    const dishId = req.params.dishId
    if (id !== "" && id !== dishId && id !== null && id !== undefined) {
      next({
        status: 400,
        message: `id ${id} must match dataId provided in parameters`,
      })
    }
    return next()
}


/////////////////////////////////////////////

///////////   HTTP FUNCTIONS   //////////////


// list() to list all dishes:
function list(req, res) {
    res.json({
        data: dishes
    })
}


// read() to read a particular dishId:
function read(req, res) {
    // uses dish id parameter from request
    const dishId = req.params.dishId
    // create variable for finding the dish with the correct id
    const matchingDish = dishes.find((dish) => dish.id === dishId)
    // return that dish's data
    res.json({ data: res.locals.matchingDish })
}


// create() to post a new dish:
function create(req, res) {
    const { data: { name, description, price, image_url } = {} } = req.body
    // dish object for making an update request.
    const newDish = {
        id: nextId(),
        name, 
        description,
        price, 
        image_url,
    }
    //push new dish onto array of all other dishes
    dishes.push(newDish)
    //send an okay status and the new dish object.
    res.status(201).json({ data: newDish })
}


// handler for updating a dish's data
function update(req, res) {
    const dishId = req.params.dishId
    // create variable that finds the dish with a matching id
    const matchingDish = dishes.find((dish) => dish.id === dishId)
    const { data: { name, description, price, image_url } = {} } = req.body
    // use that variable to define the key-value pairs of the new dish
    matchingDish.description = description
    matchingDish.name = name
    matchingDish.price = price
    matchingDish.image_url = image_url
    // return the new dish's data
    res.json({ data: matchingDish })
  }

module.exports = {
    list,
    read: [dishExists, read],
    create: [
        bodyHasName, 
        bodyHasDescription,
        bodyHasPrice,
        bodyHasValidPrice,
        bodyHasImg,
        create,
    ],
    update: [
        dishExists,
        dishIdMatchesDataId, 
        bodyHasName, 
        bodyHasDescription,
        bodyHasPrice,
        bodyHasImg,
        bodyHasValidPriceForUpdate,
        update,
    ],
}