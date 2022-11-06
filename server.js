const express = require("express");
const { fork } = require("child_process");
const cluster=require('cluster')
const numCPUs=require('os').cpus().length
const yargs = require("yargs");
const args = yargs(process.argv.slice(2))
  .alias({
    p: "puerto",
    m:'modo'
  })
  .default({
    puerto: 8080,
    modo:'fork'

  }).argv;

const PORT = process.argv[2] || 8082;
const clusterMode=process.argv[3] === 'CLUSTER'

// app.use(express.static("public"));


if(clusterMode && cluster.isPrimary){
  console.log('Cluster iniciado')
  for(let i = 0; i < numCPUs; i++){
    cluster.fork()
  }

  cluster.on('exit', worker=>{
    console.log(`Worker ${worker.process.pid} died`)
    cluster.fork()
  })
}else{
  const app = express()
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  

  app.get("/", (req, res) => {
    res.redirect('/info');
  });


  app.get("/info", (req, res) => {
    const memory = process.memoryUsage();
    res.json({
      "Argumentos de entrada": args._,
      "Plataforma": process.platform,
      "Version de Node": process.version,
      "Memoria Rss": memory.rss,
      "Path de Ejecucion": process.execPath,
      "Process Id": process.pid,
      "Carpeta del Proyecto": process.cwd(),
      'Numero de Cpus':numCPUs,
      "Puerto":PORT
    });
  });
  
  
  app.get("/api/randoms", (req, res) => {
    const child = fork("./fork/child.js");
    const cantidad = req.query.cantidad ? req.query.cantidad : 1000000000;
    child.send(cantidad);
    child.on("message", (msg) => {
      console.log(msg)
    res.json({"Numeros Randoms:": msg})
    res.end();
  });
});

app.get("/datos", (req, res) => {
  console.log(`PORT: ${PORT}} -> Date: ${Date.now()}`)
  res.send(`Servidor express nginx en ${PORT} - PID: ${process.pid} - Date: ${(new Date).toLocaleString()}`);
});

app.get('*', (req,res)=>{
  res.status(400).send('Ruta no encontrada' + req.url)
})


app.listen(PORT, () => {
  console.log(`Servidor iniciado en PORT: ${PORT} - PID: ${process.pid}`);
})

}