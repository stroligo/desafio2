const express = require("express");
const { uuid, isUuid } = require('uuidv4'); 
const cors = require("cors");

// const { uuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

app.use(logRequests); //Controle de rotas
app.use('/repositories/:id', validadeRepositoriesId); //Valida ID 

//VAR PRINCIPAL
const repositories = [];

// CONTROLE DE ROTAS - LOG
function logRequests(request, response, next) {
  const { method, url} = request;
  const logLabel = `[${method.toUpperCase()}] ${url}`;
  console.time(logLabel); 
  next(); 
  console.timeEnd(logLabel); 
};
// VALIDA ID
function validadeRepositoriesId(request, response, next){
  const { id } = request.params;
  if(!isUuid(id)){
    return response.status(400).json({error: 'Invalid repositorories ID'});
  }
  return next();
};
//------------------------------

// METHOD GET
app.get("/repositories", (request, response) => {
  const {title} = request.query;
  const results = title
    ? repositories.filter(repository => repository.title.includes(title))
    : repositories;
  console.log('Requested listing');
  return response.json(results); 
});
// METHOD POST
app.post("/repositories", (request, response) => {
  const {title , url, techs, likes}= request.body;
  const repository = { id: uuid(), title, url, techs, likes};
  repositories.push(repository);  
  console.log('New repository added');
  return response.json(repository); 
});
// METHOD PUT
app.put("/repositories/:id", (request, response) => {
  const { id } = request.params; 
  const {title , url, techs}= request.body;
  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
  
  if(repositoryIndex < 0){
    console.log('Modification denied');
     return response.status(400).json({ error: 'Repository not found'}) 
     }
  const repository = { id, title, url, techs};
  repositories[repositoryIndex] = repository; 
  console.log('Modification accepted');
  return response.json(repository); 
});

// METHOD DELETE
app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
  
  if(repositoryIndex < 0){
     return response.status(400).json({ error: 'Repository not found'})
     }

  repositories.splice(repositoryIndex, 1); 
  console.log('Deleted repository');
  return response.status(204).send(); 
});

// METHOD POST LIKE 
app.post("/repositories/:id/likes", (request, response) => {
  const {id} = request.params; 
  const {likes} = request.query;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
    if(repositoryIndex < 0){
    console.log('Modification denied');
     return response.status(400).json({ error: 'Repository not found'}) 
     };

     let totalLikes = parseInt(repositories[repositoryIndex].likes);
     totalLikes++;
     repositories[repositoryIndex].likes = totalLikes;       
  console.log('Likes ADD');
  return response.json(totalLikes); 
});

module.exports = app; 