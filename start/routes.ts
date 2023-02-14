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
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.group(() => {
    Route.get('/login', 'AuthController.login')
    Route.delete('/logout', 'AuthController.logout').middleware('auth:api')
  }).prefix('auth')

  Route.group(() => {
    Route.get('/qr', 'WhatsappsController.qr')
    Route.put('/hook', 'WhatsappsController.setHook')
    Route.get('/hook', 'WhatsappsController.hook')
    Route.get('/stats', 'WhatsappsController.stats')
    Route.post('/', 'WhatsappsController.send')
    Route.get('/', 'WhatsappsController.getHistory')
  })
    .prefix('whatsapp')
    .middleware('auth:api')

  Route.group(() => {
    Route.delete('/api/:id', 'SettingsController.deleteApiKey')
    Route.get('/api/:id', 'SettingsController.getApiKey')
    Route.get('/api', 'SettingsController.apiKeyList')
    Route.post('/api', 'SettingsController.addApiKey')
    Route.put('/change-password', 'SettingsController.changePassword')
  })
    .prefix('setting')
    .middleware('auth:api')
}).prefix('api')

Route.get('*', async ({ view }: HttpContextContract) => {
  return view.render('index')
})
