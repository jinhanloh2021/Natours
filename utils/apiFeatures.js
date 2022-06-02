class APIFeatures {
  //query = Tours.find() = Mongoose.query Object that has no filter. The entire Tour collection.
  //queryString = req.query = JSON { duration: { gte: '6' }, sort: 'duration,-price', page: '2' }
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //removing page, sort, limit, fields from the queryString
    //Add the dollar sign right before gte|gt|lte|lt
    // { duration: { gte: '6' }, sort: 'duration,-price', page: '2' } -> { duration: { '$gte': '6' } }
    const { page, sort, limit, fields, ...queryObj } = this.queryString;
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this; //Mutates query object and returns mutated APIFeatures instance so we can chain methods.
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt'); //default: sort by desc createdAt
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fieldsString = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fieldsString);
    } else {
      this.query = this.query.select('-__v'); //excludes __v field.
    }
    return this;
  }

  paginate() {
    const pageNumber = this.queryString.page * 1 || 1;
    const limitNumber = this.queryString.limit * 1 || 100;
    const skip = (pageNumber - 1) * limitNumber;

    this.query = this.query.skip(skip).limit(limitNumber);
    return this;
  }
}

module.exports = APIFeatures;
