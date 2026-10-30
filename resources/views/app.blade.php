<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1">
  {{-- apply the saved theme before anything paints (same logic as resources/js/lib/theme.js) --}}
  <script>
    (function () {
      var pref = 'system';
      try { pref = localStorage.getItem('theme') || 'system'; } catch (e) {}
      var dark = pref === 'dark' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (dark) document.documentElement.classList.add('dark');
    })();
  </script>
  @viteReactRefresh
  @vite('resources/js/App.jsx')
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