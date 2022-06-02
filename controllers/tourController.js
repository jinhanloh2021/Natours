const tourModel = require('../models/tourModel');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.getAllTours = (req, res) => {
  console.log('hello from getAllTours()');
  res.status(200).json({
    status: 'success',
    // data: {
    //   tours,
    // },
  });
};

exports.getSpecificTour = (req, res) => {
  console.log(req.params); //will give back id
  const id = req.params.id * 1; //cast numeric string to number
  // const tour = tours.find((el) => el.id === id); //returns first element that matches id

  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour,
  //   },
  // });
};

exports.addTour = async (req, res) => {
  //Creates new document, then call .save() on the document to add to collection.
  // const newTour = new Tour({});
  // newTour.save()
  try {
    //Directly creates new document in collection
    const newTour = await tourModel.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail.',
      message: err,
    });
  }
};

exports.patchSpecificTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<updated tour>',
    },
  });
};

exports.deleteSpecificTour = (req, res) => {
  res.status(204).json({
    //status code 204: no content
    status: 'success',
    data: null,
  });
};
