const { Worker } = require('bullmq')

const worker = new Worker('whatsapp_worker', async (job) => {
  console.log(job)
})
