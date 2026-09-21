const successResponse = (res, message = 'Success', data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const paginatedResponse = (res, message = 'Success', { items, total, page, limit }, statusCode = 200) => {
  const pages = Math.ceil(total / limit) || 1;
  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      items,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages,
        hasNextPage: page < pages,
        hasPrevPage: page > 1,
      },
    },
  });
};

module.exports = {
  successResponse,
  paginatedResponse,
};
