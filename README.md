# Node - Mongo with authentication enabled

> :uk: :warning: :warning: :warning: **This repo is simply intended as a playground to try fixing issues I got with authentication in a dockerized Node.js/mongoDB application**. Don't take my word for it.

> :fr: :warning: :warning: :warning: **Ce repo est un bac à sable visant à identifier et régler des problèmes rencontrés avec l'authentification, dans une application Node.js/mongoDB**. Ne prenez pas le contenu de ce repo pour argent comptant !

Sources:

* [docker MongoDB and CouchDB authentication](https://github.com/ns-mnawaz/mongo-couch-auth)
* [docker-mongo-auth](https://github.com/aashreys/docker-mongo-auth)
* [How to Enable Authentication on MongoDB (medium)](https://medium.com/mongoaudit/how-to-enable-authentication-on-mongodb-b9e8a924efac)
* [How To Secure MongoDB on Ubuntu 20.04 (DigitalOcean)](https://www.digitalocean.com/community/tutorials/how-to-secure-mongodb-on-ubuntu-20-04)

## Directement sur l'instance de l'hôte macOS

Tuto medium adapté pour macOS (mongo 4.4 installé avec brew)

### 1. démarrage mongo

### 2. connexion

Connection en local (j'avais pas besoin de mettre l'URL de connexion mais bon).```
mongo mongodb://localhost:27017
```

```
> show dbs
admin           0.000GB
config          0.000GB
local           0.000GB
np_media_cache  0.135GB
nporder_dev     0.011GB
pfpa            0.000GB
pfpa_dev        0.000GB
```

### 3. créer admin

Exécuter `use admin`

Puis :

```
db.createUser(
  {
    user: "superadmin",
    pwd: "AdminP4ss",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
  }
)
```

Logout

### 4. activer l'authentification

Ajouter à `/usr/local/etc/mongod.conf` :

```
security:
  authorization: "enabled"
```

Identifier le service mongo avec `brew services list`

Puis redémarrer le service : `brew services restart mongodb-community@4.4`

### 5. Se connecter comme admin

```
mongo mongodb://localhost:27017
```Puis dans le shell mongo `db.auth("superadmin","AdminP4ss");` (par contre l'auth direct en mettant `mongo mongodb://superadmin:AdminP4ss@localhost` ne fonctionne pas)Et effectivement, `show dbs` non identifié ne montre rien, mais une fois identifié on voit les dbs.

### 6. créer d'autres utilisateurs

#### a. test app Node.js

**AJOUTER LIEN REPO**

Lancer l'app node : MONGO_HOST=localhost node index (username = nodeapp, password = passwd, nom db = nodemongo)
Echec (tente de se connecter sur mongodb://nodeapp:passwd@localhost:27017/nodemongo) :

```
MongoServerError: Authentication failed.
    at Connection.onMessage (/Users/benoit/Code/node-mongo-with-auth/node_modules/mongodb/lib/cmap/connection.js:230:30)
    at MessageStream.<anonymous> (/Users/benoit/Code/node-mongo-with-auth/node_modules/mongodb/lib/cmap/connection.js:61:60)
    at MessageStream.emit (node:events:527:28)
    at processIncomingData (/Users/benoit/Code/node-mongo-with-auth/node_modules/mongodb/lib/cmap/message_stream.js:125:16)
    at MessageStream._write (/Users/benoit/Code/node-mongo-with-auth/node_modules/mongodb/lib/cmap/message_stream.js:33:9)
    at writeOrBuffer (node:internal/streams/writable:389:12)
    at _write (node:internal/streams/writable:330:10)
    at MessageStream.Writable.write (node:internal/streams/writable:334:10)
    at Socket.ondata (node:internal/streams/readable:754:22)
    at Socket.emit (node:events:527:28) {
  ok: 0,
  code: 18,
  codeName: 'AuthenticationFailed',
  connectionGeneration: 0,
  [Symbol(errorLabels)]: Set(2) { 'HandshakeError', 'ResetPool' }
}
```

#### b. création user

```
db.createUser(
  {
    user: "nodeapp",
    pwd: "passwd",
    roles: [ { role: "readWrite", db: "nodemongo" } ]
  }
)
```

#### c. lancement app Node après coup

Toujours la même erreur. Erreurs possibles ? Ai-je créé l'user en étant dans la db admin ?

Relance mongo puis `db.auth("superadmin","AdminP4ss");` puis `use admin` puis :

```
db.createUser(
  {
    user: "nodeapp",
    pwd: "passwd",
    roles: [ { role: "readWrite", db: "nodemongo" } ]
  }
)
```

TOUJOURS erreur en lançant mongo mongodb://nodeapp:AdminP4ss@localhost:27017/nodemongo?authSource=admin

MAIS je viens de voir dans l'article Medium qu'il fallait se mettre sur la db nodemongo (eux c'est test) avant de créer l'user !!

Mais même en faisant `use nodemongo` avant de créer l'user, même pb

## Dans une VM Linux

* [Install mongo on Ubuntu](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/)

Remplacé 6.0 par 4.4.

```
sudo apt-get install -y gnupg
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

### Récupération app

Cloné le repo de l'app, elle marche sans l'auth.

### 1. Ajout admin mongo

Suivre le [tuto de DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-secure-mongodb-on-ubuntu-20-04#step-1-adding-an-administrative-user)

Run `mongo`, puis `use admin`, puis adapte l'original du tuto de ceci :

```
db.createUser(
  {
    user: "AdminSammy",
    pwd: passwordPrompt(),
    roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
  }
)
```

&hellip; à ceci (mix entre tuto medium et celui-ci) :

```
db.createUser(
  {
    user: "superadmin",
    pwd: "AdminP4ss",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
  }
)
```

Puis quitte.

### 2. Activation auth

```
sudo nano /etc/mongod.conf
```

et ajoute :

```
security:
  authorization: enabled
```

puis :

```
sudo systemctl restart mongod
```

Test l'accès :

```
mongo -u superadmin -p --authenticationDatabase admin
```

Entre le pwd `AdminP4ss`. Ça marche.

### Dans l'app node...

Ça marche avec le **compte admin**.

Le `.env` qui va avec :

```
MONGO_HOST=localhost
MONGO_USERNAME=superadmin
MONGO_PASSWORD=AdminP4ss
MONGO_DBNAME=admin
```

Création d'un compte standard

```
db.createUser(
  {
    user: "nodeapp",
    pwd: "passwd",
    roles: [
      { role: "readWrite", db: "nodemongo" }
    ]
  }
)
```

Le `.env` qui va avec :

```
MONGO_HOST=localhost
MONGO_USERNAME=nodeapp
MONGO_PASSWORD=passwd
MONGO_DBNAME=nodemongo
```

Et ça marche !

