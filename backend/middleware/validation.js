// const validate = (schema, location = 'body') => (req, res, next) => {
//   try {
//     const target = location === 'query' ? req.query : location === 'params' ? req.params : req.body;
//     const { error, value } = schema.validate(target, {
//       abortEarly: true,
//       allowUnknown: true,
//       stripUnknown: true,
//       convert: true
//     });
//     if (error) {
//       return res.status(400).json({
//         error: error.details[0].message
//       });
//     }
//     if (location === 'query') req.query = value;
//     else if (location === 'params') req.params = value;
//     else req.body = value;
//     next();
//   } catch (e) {
//     return res.status(400).json({ error: 'Invalid request data' });
//   }
// };


const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: error.details[0].message
    });
  }
  next();
}
export default validate;