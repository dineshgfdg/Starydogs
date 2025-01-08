app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com; " +
    "connect-src 'self' https://*.googleapis.com https://*.gstatic.com https://dog-stray-backend-x7ik.onrender.com;"
  );
  next();
}); 