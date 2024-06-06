// settingsController.js

const Settings = require("../model/SettingsModel.js");
const User = require ("../model/UserModel.js");

// Controller pour récupérer les paramètres de notification d'un utilisateur
exports.getUserSettings = async (req, res) => {

  try {
    const userId = req.params.userId; // Supposons que l'ID de l'utilisateur est envoyé dans les paramètres de la requête
    const settings = await Settings.findOne({ userId });
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des paramètres de notification de l'utilisateur" });
  }
}
// Controller pour mettre à jour ou créer les paramètres de notification d'un utilisateur
exports.updateOrCreateUserSettings = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { globalNotificationDays, customNotifications } = req.body;

    // Vérifier si les paramètres existent déjà pour l'utilisateur
    let settings = await Settings.findOne({ userId });

    if (!settings) {
      // Créer de nouveaux paramètres si aucun n'existe
      settings = new Settings({ userId });
    }

    // Mettre à jour les paramètres de notification globale uniquement si fourni
    if (globalNotificationDays !== undefined) {
      settings.globalNotificationDays = globalNotificationDays !== null ? globalNotificationDays : 30;
    } else if (settings.globalNotificationDays === null) {
      settings.globalNotificationDays = 30;
    }

    // Vérifier si les services dans customNotifications sont associés à l'utilisateur
    if (customNotifications && customNotifications.length > 0) {
      const user = await User.findById(userId).populate('services');
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      const userServiceIds = user.services.map(service => service._id.toString());
      const invalidServices = customNotifications.filter(notification => !userServiceIds.includes(notification.serviceId));

      if (invalidServices.length > 0) {
        return res.status(400).json({ message: "Un ou plusieurs services spécifiés ne sont pas associés à l'utilisateur" });
      }

      // Fusionner les notifications existantes et les nouvelles notifications
      const notificationMap = new Map();

      // Ajouter les notifications existantes au map
      if (settings.customNotifications) {
        settings.customNotifications.forEach(notification => {
          notificationMap.set(notification.serviceId.toString(), notification);
        });
      }

      // Ajouter les nouvelles notifications au map, écrasant les anciennes si nécessaire
      customNotifications.forEach(notification => {
        notificationMap.set(notification.serviceId.toString(), notification);
      });

      // Convertir le map en array
      settings.customNotifications = Array.from(notificationMap.values());
    }

    await settings.save();
    res.status(200).json({ message: "Paramètres de notification mis à jour avec succès", settings });
  } catch (error) {
    console.error("Erreur lors de la mise à jour ou de la création des paramètres de notification de l'utilisateur:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
