const express = require('express');
const { countUsers, deleteAccount,getProfile, getAllUsers, updatePassword, updateUser ,getAllUsersWithServices,  removeServiceFromUser,assignServicesToUser,updateUserRole, getUsersWithServicesCount } = require('../controller/userController.js');
const { verifyToken , verifyTokenAndAdmin} = require('../verifyToken.js');
const { upload } = require('../utils/multer.js');

const UserRoutes = express.Router();

//Get All Users
UserRoutes.get('/allUsers', getAllUsers);


// Get user info
UserRoutes.get('/userinfo',verifyToken, getProfile);


//Update User Info
UserRoutes.patch('/update',verifyToken, upload.single("image"), updateUser);

UserRoutes.patch('/update-other-user/:id',verifyToken, updateUser);

UserRoutes.patch("/update-role/:id", verifyToken, updateUserRole)

//Update User Password
UserRoutes.patch('/change-password',verifyToken, updatePassword);

//Delete User Account
UserRoutes.delete('/:id', deleteAccount);

//Count All Users
UserRoutes.get('/countUsers', countUsers);

//assignServicesToUser
UserRoutes.patch('/assignServicesToUser',verifyTokenAndAdmin, assignServicesToUser);


UserRoutes.get('/getAllUsersWithServices', getAllUsersWithServices);

UserRoutes.post('/removeServiceFromUser', removeServiceFromUser);

// pour les diagrammes
UserRoutes.get('/getUsersWithServicesCount', getUsersWithServicesCount);

module.exports =  UserRoutes;
