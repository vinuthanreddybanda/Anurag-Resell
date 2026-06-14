const AppError = require('../utils/appError');

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return next(new AppError('Please provide a valid name', 400));
  }

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return next(new AppError('Please provide an email address', 400));
  }

  // Validate college email domain
  const collegeDomain = process.env.COLLEGE_DOMAIN || 'edu';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError('Please provide a valid email format', 400));
  }

  const normalizedEmail = email.toLowerCase().trim();
  const endsWithDomain = normalizedEmail.endsWith(`.${collegeDomain.toLowerCase()}`) || 
                         normalizedEmail.endsWith(`@${collegeDomain.toLowerCase()}`);
  
  if (!endsWithDomain) {
    return next(new AppError(`Registration is restricted to college emails ending in ${collegeDomain}`, 400));
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return next(new AppError('Password must be at least 6 characters long', 400));
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
};
