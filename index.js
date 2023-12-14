const express = require("express")
const jwt = require('jsonwebtoken')
const mongoose = require("mongoose")
const bodyParser = require('body-parser')


const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))


app.get("/", async (req, res) => {
  res.send('biblioteca-api is running')
})

//#region Login
const User = mongoose.model("user", {
  name: String,
  username: String,
  password: String,
});

function verifyToken  (req, res, next) {
  try {
      const authorization = req.header('authorization') // Bearer token_JWT
      let token = undefined
      if(authorization) {
          const parts = authorization.split(' ')
          if(parts.length === 2 && parts[0] === 'Bearer') {
              token = parts[1]
          }
      }

      if(!token) {
          throw new Error('A token is required to access this endpoint')
      }

      const decoded = jwt.verify(token, constants.security.secret)

      req.authenticated = decoded

      next()
  } catch(err) {
      next(err)
  }
}
app.post("/", async (req, res) => {
  const data = req.body
  const hash = await bcrypt.hash(data.password, 10)

  data.password = hash
  console.log(data.password)

  const user = new User(data)

  const savedUser = await user.save()
  res.send(user)
});

app.get("/user", verifyToken(req, res, next), async (req, res, next) => {
  const users = await User.find()
  for (let user of users) {
    user.password = undefined
  }

  res.send(users);
});

app.delete("/user/:id", verifyToken, async (req, res) => {
  const user = await User.findByIdAndRemove(req.params.id)
  res.send(user)
})

app.put("/user/:id", verifyToken, async (req, res) => {
  const body = req.body 
  const upuser = await User.findByIdAndUpdate(req.params.id, body, {new: true})
  res.send(upuser)
})

app.post("/autenticar", async (req, res) => {
  const { username, password } = req.body

  if (!(username && password)) {
      throw new Error('Usuário e senha são obrigatórios!')
  }

  const user = await User.findOne({ username })

  if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({
          sub: user._id,
          iss: constants.security.iss,
          username: user.username,
          name: user.name,
      }, constants.security.secret, {
          expiresIn: '5h'
      })

      res.status(200).json(token)
  } else {
      throw new Error('Usuário/senha inválidos!')
  }
})

//#endregion

//#region Film
const Film = mongoose.model("film", {
  title: String,
  description: String,
  image_url: String,
  trailer_url: String,
});

app.get("/film", verifyToken, async (req, res, next) => {
  const films = await Film.find()
  res.send(films);
});

app.delete("/film/:id", verifyToken, async (req, res) => {
  const film = await Film.findByIdAndRemove(req.params.id)
  res.send(film)
})

app.put("/film/:id", verifyToken, async (req, res) => {
  const body = req.body 
  const upfilm = await Film.findByIdAndUpdate(req.params.id, body, {new: true})
  res.send(upfilm)
})

app.post("/film", verifyToken, async (req, res) => {
  const body = req.body
  const dataFilm = new Film(body)
  await dataFilm.save()
  res.send(dataFilm)
});

//#endregion

//#region Client
const Client = mongoose.model("client", {
  name: String,
  birthday: Date,
  image_url: String,
  address: String
});

app.get("/client", verifyToken, async (req, res) => {
  const clients = await Client.find()
  res.send(clients);
});

app.delete("/client/:id", verifyToken, async (req, res) => {
  const client = await Client.findByIdAndRemove(req.params.id)
  res.send(client)
})

app.put("/client/:id", verifyToken, async (req, res) => {
  const body = req.body 
  const upclient = await Client.findByIdAndUpdate(req.params.id, body, {new: true})
  res.send(upclient)
})

app.post("/client", verifyToken, async (req, res) => {
  const body = req.body
  const dataClient = new Client(body)
  await dataClient.save()
  res.send(dataClient)
});
//#endregion

app.listen(port, () => {
  mongoose.connect(
    "mongodb+srv://iasminesilva:pwiiunidesc@cluster0.ahmlsna.mongodb.net/pwii?retryWrites=true&w=majority"
  )
  const db = mongoose.connection
  db.on('connected', (err, res) => console.log('Conectado ao DB!'))

  console.log("App rodando!")
});

