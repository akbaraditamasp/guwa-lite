/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.group(() => {
    Route.get('/login', 'AuthController.login')
    Route.delete('/logout', 'AuthController.logout').middleware('auth:api')
  }).prefix('auth')

  Route.group(() => {
    Route.get('/qr', 'WhatsappsController.qr').middleware('auth:api')
    Route.put('/hook', 'WhatsappsController.setHook').middleware('auth:api')
    Route.get('/hook', 'WhatsappsController.hook').middleware('auth:api')
    Route.post('/', 'WhatsappsController.send').middleware('auth:api')
    Route.get('/', 'WhatsappsController.getHistory').middleware('auth:api')
  }).prefix('whatsapp')
}).prefix('api')
