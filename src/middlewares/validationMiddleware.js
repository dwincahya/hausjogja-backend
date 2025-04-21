const validateRegister = (req, res, next) => {
    const { name, email, password } = req.body;
  
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide name, email and password',
      });
    }
  
    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters',
      });
    }
  
    next();
  };
  
  const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password',
      });
    }
  
    next();
  };
  
  const validateProduct = (req, res, next) => {
    const { name, price, categoryId } = req.body;
  
    if (!name || !price || !categoryId) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide name, price and categoryId',
      });
    }
  
    next();
  };
  
  const validateCategory = (req, res, next) => {
    const { name } = req.body;
  
    if (!name) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide category name',
      });
    }
  
    next();
  };
  const validateOrder = (req, res, next) => {
    const { items, address } = req.body;
  
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide at least one item to order',
      });
    }
  
    // Validate each item has productId and quantity
    const invalidItems = items.filter(
      item => !item.productId || !item.quantity || item.quantity <= 0
    );
  
    if (invalidItems.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Each item must have a valid productId and positive quantity',
      });
    }
  
    if (!address || address.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a delivery address',
      });
    }
  
    next();
  };
  
  // Export the function
  module.exports = {
    validateRegister,
    validateLogin,
    validateProduct,
    validateCategory,
    validateOrder,
  };