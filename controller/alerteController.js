const Alerte = require('../model/AlerteModel');
const User = require('../model/UserModel');
const Service = require('../model/ServiceModel');
const Settings = require('../model/settingsModel');

async function checkAndCreateAlerts() {
  try {
    // Récupérer tous les utilisateurs
    const users = await User.find().populate('services').exec();


    // Parcourir chaque utilisateur
    for (const user of users) {
      // Récupérer les paramètres de notification de l'utilisateur
      const settings = await Settings.findOne({ userId: user._id }).exec();
      let globalNotificationDays = settings ? settings.globalNotificationDays : 30;
      // Parcourir chaque service de l'utilisateur
      for (const service of user.services) {
        let notificationDays = globalNotificationDays;

        // Vérifier s'il y a des notifications personnalisées pour ce service
        if (settings && settings.customNotifications) {
          const customSetting = settings.customNotifications.find(sn => sn.serviceId.equals(service._id));
          if (customSetting) {
            notificationDays = customSetting.notificationDays;
          }
        }

        // Calculer le temps restant jusqu'à la date d'expiration du service
        const currentTime = new Date();
        currentTime.setHours(0, 0, 0, 0);
        //console.log(currentTime)

        const expirationTime = new Date(service.date_fin);
        expirationTime.setHours(0, 0, 0, 0);

        //console.log(expirationTime) ;       

        const timeDiff = expirationTime.getTime() - currentTime.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        //console.log(daysDiff)

        //console.log(daysDiff === notificationDays)
        // Créer et enregistrer une alerte si le temps restant est égal au paramètre de notification
        if (daysDiff === notificationDays) {
          const message = `Le service ${service.nom} expire dans ${notificationDays} jours.`;


          // Obtenir la date actuelle sans l'heure (début de la journée)
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // Vérifier si une alerte existe déjà pour ce service, ce user et ce fournisseur avec le même message pour la même journée
          const existingAlert = await Alerte.findOne({
            serviceId: service._id,
            userId: user._id,
            fournisseurId: service.fournisseur,
            message: message,
            createdAt: { 
              $gte: today,
              $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Fin de la journée
            },
            deleted: false
          });

          if (!existingAlert) {
            const newAlert = new Alerte({
              serviceId: service._id,
              userId: user._id,
              fournisseurId: service.fournisseur,
              message: message,
              statut: 'unread',
              deleted: false,
              createdAt: new Date()
            });

            await newAlert.save();
            console.log('Alerte enregistrée:', newAlert);
          } else {
            console.log(`Alerte déjà existante pour le service ${service.nom} aujourd'hui.`);
          }
        } else {
          //console.log(`Pas d'alerte à créer pour le service ${service.nom}. Jours restants: ${daysDiff}`);
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des alertes:', error);
  }
}

// Obtenir les alertes par utilisateur
async function getAlertesByUserId(req, res) {
  try {
    const userId = req.user._id; 
    const alertes = await Alerte.find({ userId, deleted: false }).populate('serviceId');
    let unreadAlertes = alertes.filter(alerte => alerte.statut === 'unread');
    res.status(200).json({ alertes: alertes, unreadAlertes: unreadAlertes });
  } catch (error) {
    res.status(500).send('Erreur lors de la récupération des alertes de l\'utilisateur: ' + error.message);
  }
}

// Supprimer une alerte (soft delete)
async function deleteAlerte(req, res) {
  try {
    const { id } = req.params;
    const updatedAlerte = await Alerte.findByIdAndUpdate(id, { deleted: true }, { new: true });
    if (!updatedAlerte) {
      return res.status(404).send('Alerte non trouvée');
    }
    res.status(200).json(updatedAlerte);
  } catch (error) {
    res.status(500).send('Erreur lors de la suppression de l\'alerte: ' + error.message);
  }
}

async function markAlerteAsRead(req, res) {
  try {
    const { id } = req.params;
    const alerte = await Alerte.findByIdAndUpdate(id, { statut: 'read' }, { new: true });
    if (!alerte) {
      return res.status(404).send('Alerte non trouvée.');
    }
    res.status(200).json(alerte);
  } catch (error) {
    res.status(500).send('Erreur lors de la mise à jour de l\'alerte: ' + error.message);
  }
}

module.exports = { checkAndCreateAlerts,getAlertesByUserId ,markAlerteAsRead , deleteAlerte};

