// Utility function to catch async errors and pass them to error handling middleware
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;