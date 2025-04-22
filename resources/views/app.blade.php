<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css?family=McLaren|Montserrat&display=swap"
        rel="stylesheet"/>

    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <!--Bootstrap CSS-->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <!--<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">-->

   

    @routes
    <!--update realtime-->
    @viteReactRefresh 
    <!--Introduce CSS and JS file through Vite -->
    @vite(['resources/js/App.jsx','resources/css/mobileScreen.css','resources/css/tabletScreen.css', "resources/js/Pages/{$page['component']}.jsx"])
    <!--Used for Inertia.js page rendering.-->
    @inertiaHead
  </head>
  <body>
    <!--Content rendered by Inertia.js-->
    @inertia
    
      
  </body>
</html>