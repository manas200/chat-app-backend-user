import express from "express";
import {
  getAllUsers,
  getAUser,
  loginUser,
  myProfile,
  updateName,
  verifyUser,
  updateProfilePic,
  getPrivacySettings,
  updatePrivacySettings,
  updateLastSeen,
  getUserPublicProfile,
} from "../controllers/user.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/verify", verifyUser);
router.get("/me", isAuth, myProfile);
router.get("/user/all", isAuth, getAllUsers);
router.get("/user/:id/public", getUserPublicProfile); // Privacy-aware profile - MUST be before /:id
router.get("/user/:id", getAUser);
router.post("/update/user", isAuth, updateName);
router.put("/update-profile-pic", isAuth, updateProfilePic);

// Privacy settings routes
router.get("/privacy-settings", isAuth, getPrivacySettings);
router.put("/privacy-settings", isAuth, updatePrivacySettings);

// Last seen update (internal API called by chat service)
router.post("/update-last-seen", updateLastSeen);

export default router;
