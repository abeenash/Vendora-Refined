<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1">
  @viteReactRefresh
  @vite('resources/js/app.jsx')
  @vite('resources/css/app.css')
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap">
  @inertiaHead
</head>

<body>
  @inertia
  @routes
</body>

</html>