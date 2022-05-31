const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

//Validate ID
exports.checkID = (req, res, next, val) => {
  console.log(`Validating ID: ${val}`);
  if (req.params.id * 1 > tours.length) {
    res.status(404).json({
      status: 'Fail.',
      message: 'Invalid ID.',
    });
    return;
  }
  next();
};

//Validate Body
exports.checkBody = (req, res, next) => {
  console.log('Validating body...');
  console.log(req.body); //req.body already a JSON object
  if (!req.body.hasOwnProperty('name') || !req.body.hasOwnProperty('price')) {
    console.log('Body Invalid');
    res.status(400).json({
      status: 'Fail.',
      message: 'Bad Request.',
    });
    return;
  }
  next();
};

exports.getAllTours = (req, res) => {
  console.log('hello from getAllTours()');
  res.status(200).json({
    status: 'success',
    data: {
      tours,
    },
  });
};

exports.getSpecificTour = (req, res) => {
  console.log(req.params); //will give back id
  const id = req.params.id * 1; //cast numeric string to number
  const tour = tours.find((el) => el.id === id); //returns first element that matches id

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

exports.addTour = (req, res) => {
  //console.log(req.body);
  //database specifies new ID of the tour, not the client.
  const newID = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newID }, req.body); //Object.assign combines two objects together

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) {
        console.error(err.message);
        return;
      }
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
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
