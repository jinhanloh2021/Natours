const catchAsync = (fn) => {
  //fucntion defined but not called.
  const wrappedFunc = (req, res, next) => {
    fn(req, res, next).catch(next);
    //fn called here.
    //if no error, res.json sent, cycle ends.
    //if error, next(err) called, goes to global err handler
  };
  return wrappedFunc; //return a defined function, which will be called when a http req is sent and caught by a router.
};

module.exports = catchAsync;
