# CLOUD - PROGETTO FINALE START2IMPACT

## Cosa serve per avviarlo?

- MYSQL, per importare i files presenti all interno della cartella 'MYSQL'
- NODEJS, senza questo non é possibile avviare il codice
- creare due files .env, uno per il frontend ed uno per il backend

questa é l'impostazione di come dovrebbe essere il file .env per il frontend:

```env
REACT_APP_API_URL=yourAddress`
```

questa é l'impostazione di come dovrebbe essere il file .env per il backend:

``` env
DB_HOST=yourHost
DB_USER=yourUser
DB_PASSWORD=yourPassword
DB_NAME=yourDatabase
PORT=yourPort
NODE_ENV=development
DB_PORT=yourDBPort
JWT_SECRET=yourSecretJWT
UPLOAD_DIR=uploads/
MAX_FILE_SIZE=5242880 # 5MB in bytes
ADMIN_CREATION_PASSWORD=passwordAdminControll
```

## Come avviare il progetto?

per prima cosa bisognera installare tutte le librerie, per farlo potrai usare due comandi:

```
cd .\backend\
npm install
```
questo comando ti permetterá di installare tutte le librerie per la parte del backend.
Ora toccherá installare le librerie anche per la parte del frontend. Per farlo é possibile con i seguenti comandi:

```
cd ..
cd .\frontend\
npm install
```

Ora dovrai creare i due file .env nelle due cartelle principali, backend e fronend, con all interno le informazioni riportate precedentemente.

 Inoltre bisognerá inserire i file MYSQL all interno del database, per poter configurare in un automatico MYSQL.
 I file sono presenti all interno della cartella MYSQL e saranno in tutto 6 files.
 
 Infine, dopo aver predisposto tutto per il funzionamento, bisognerá avviare il sito.
 Per farlo possiamo usare due comandi.
 
Per il backend:
 ```
cd .\backend\
node .\app.js\
```
Per il frontend:
```
cd .\frontend\
npm run start
```
Ora é tutto configurato per il corretto funzionamento del sito.
---
**Creare un account admin**
per poter creare un account admin, visto che all interno del sito non é possibile farlo, questo é il comando:
```
{
  "username": "admin",
  "password": "password",
  "role": "admin",
  "adminPassword": "password presente sul file .env"
}
```
é possibile utilizzare postman cliccando [qui](https://www.postman.com/)

adminPassword é una password presente nel file .env che permette solamente a chi conosce la password di poter creare un account admin, cosí da alzare la sicurezza.

una volta entrati all interno della pagina sará possibile cambiare la password a proprio piacimento, cosi da non renderlo vulnerabile.


## Come é strutturato il sito?

partendo dal frontend ci sono 3 pagine principali:
- Home.jsx, dove ci sará la homepage del sito. In questa pagina é possibile vedere le cartelle create, i file caricati ed i file condivisi con altre persone.
- DynamicFolderPage.jsx, si arriva a questa pagina quando si clicca su una cartella presente nella home e da qui in poi si rimane sempre su questa pagina a meno che non si torni ad una cartella presente nella home.
- App.js, questo é il primo file che viene avviato quando si apre il sito, che sarebbe la pagina di login e registrazione.

Nella cartella frontend sono presneti anche altri file, nella cartella components, ovvero tutti quei file che girano intorno ai 3 principali.
Il file index.js é la route del frontend, dove ripartisce gli url del sito


nella parte del backend invece c'é solo un file principale:

- app.js, dove partono le richieste per le varie routes create.

é presente anche il file db.js che serve per poter connettersi e vedere se ci fossero degli errori con MYSQL.

nelle cartelle invece possiamo trovare la routes, dove sono presenti tutte le richieste che vengono fatte ai controller, ma passando anche per i middlewares, ovvero dei controlli del token oopure per riconoscere se un utente é un admin oppure no.
I file sono suddivisi in:
- admin
- auth
- file
- settings
- shared
- user

é presente anche la cartella uploads, dove all'interno di questa cartella vengono create le cartelle degli utenti, quando un utente si registra ed all interno della cartella creata, tutte le cartelle o immagini che caricherá l'utente.
Nella cartella test invece c'é un file che va a controllare che l'app.js funzioni correttamente. per avviarlo toccherá entrare nella cartella 'test' con il terminale e digitare `npm test`.

## Per far funzionare il codice, cosa é stato inserito?

nel frontend é presente:
- axios, per poter fare le richieste al backend,
- react-router-dom, utilizzato per i collegamenti, rindirizzamenti ec.
- react, per chiamare degli stati, useState, useEffect ec.

invece nel backend é presente:
- express, é una libreria per Node.js utilizzata per creare applicazioni web e API.
- cors, é un middleware per gestire il Cross-Origin Resource Sharing.
- dotenv, é una libreria per gestire variabili di ambiente da un file .env.
- path, é un modulo built-in di Node.js per lavorare con i percorsi dei file.
- url, é un modulo built-in di Node.js per lavorare con gli URL.
- mysql2, é un client MySQL per Node.js che supporta sia callback che Promises.
- fs, é modulo built-in di Node.js per lavorare con il file system.
- bcryptjs, é una libreria per hashare password in modo sicuro.
- jsonwebtoken, é una libreria per creare e verificare JSON Web Tokens (JWT).
- express-rate-limit, é un middleware per limitare il numero di richieste al server.
- multer, é un middleware per gestire l'upload di file.
- sinon.js, è una libreria per creare mocks, stubs, e spies per il testing.
- supertest, è una libreria per testare API HTTP.
- chai è una libreria di assertion per JavaScript, comunemente usata nei test.
- qrcode, é una libreria per generare codici QR.

# Informzioni aggiuntive
La libreria express-rate-limit serve principalmente per difendersi dai attacchi di tipo brute force. 
Nel sito infatti sará possibile fare 5 tentativi di accesso dopo di che sarai bloccato per 3 minuti, sia nel fronend, non potendo piú provare a fare il login che dalla parte di backend, grazie appunto a questa libreria.
All'interno del codice é presente una predisposizione (quasi) completa, per generare dei qrCode per le immagini, ma per non sforare troppo le 20 ore previste dal progetto, ho preferito fare la predisposizione cosi da poterlo concludere successivamente.
