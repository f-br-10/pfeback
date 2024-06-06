const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require('node-cron');
const AuthRoutes = require ("./router/authRoute.js");
const UserRoutes = require ("./router/userRoutes.js");
const serviceroute = require ("./router/serviceRoute.js");
const settingsRoutes = require ("./router/settingsRoutes.js");
const alerteRoutes = require ("./router/alerteRoutes.js");
const ReclamationRoute = require ("./router/reclamationRoute.js");
const fournisseurRoute = require ("./router/fournisseurRoute.js");
const clientRoute = require ("./router/clientRoute.js");
const factureRoute = require ("./router/factureRoute.js");
const syncRoute = require ("./router/syncRoute.js");
const chartRoute = require ("./router/chartRoutes.js");

const {fetchAndStoreOvhServices,updateServiceStatus} = require('./controller/serviceController'); 
const {fetchAndStoreReclamations} = require('./controller/ovhReclamationController');
const {updateServiceReferences} = require('./controller/serviceController.js');
const {checkAndCreateAlerts} = require('./controller/alerteController.js');
const {fetchAndStoreOvhBills} = require('./controller/factureController.js');
const {getAllUsersWithServices} = require('./controller/userController.js');


const path = require("path");


const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const port = 3000;
dotenv.config();

app.listen(port, () => console.log("le serveur a demarré au port " + port))

app.use("/", express.static(path.join(__dirname, "./uploads")));


app.use("/api/auth", AuthRoutes);
app.use("/api/user", UserRoutes);
app.use("/api/service", serviceroute);
app.use("/api/settings", settingsRoutes);
app.use("/api/alerte", alerteRoutes);
app.use("/api/reclamation", ReclamationRoute);
app.use("/api/fournisseur", fournisseurRoute);
app.use("/api/client", clientRoute);
app.use("/api/facture", factureRoute);
app.use("/api/sync", syncRoute);
app.use("/api/chart", chartRoute);


//Connect with DB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async() => {
    console.log("Connected to DB!");
    await fetchAndStoreOvhServices();
    await fetchAndStoreReclamations();
    await fetchAndStoreOvhBills();
    await  checkAndCreateAlerts(); 

    await updateServiceStatus();


  })
  .catch((error) => {
    console.log(error.message);
  });


  cron.schedule('0 0 * * *', () => {
    // Fonction à exécuter tous les jours à minuit
    fetchAndStoreOvhServices()
    fetchAndStoreReclamations() 
    updateServiceStatus()
    checkAndCreateAlerts()
    fetchAndStoreOvhBills()

  });
 