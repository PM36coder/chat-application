import { User } from "../models/usersSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudianry.js";

// Registration
const registerUser = async (req, res) => {
  const { fullname, username, email, gender, password, profile } = req.body;
// console.log("📥 Incoming req.body:", req.body);
  try {
    if (!fullname || !username || !email || !gender || !password) {
      return res.status(400).json({ msg: "Please fill all fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already exists" });
    }

const existingUserName = await User.findOne({ username });
    if (existingUserName) {
      return res.status(400).json({ msg: "username already exists" });
    }


   const defaultProfile =
  gender === "male"
    ? `https://robohash.org/${username}?set=set1`
    : `https://robohash.org/${username}?set=set2`;



    

    const newUser = await User.create({
      fullname,
      username,
      email,
      gender,
      password,
      profile: profile || defaultProfile,
    });

    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, username: newUser.username },
      process.env.JWT_TOKEN,
      { expiresIn: "1d" }
    );

    newUser.password = undefined;

    // Set JWT in HTTP-only cookie
    res
      .status(201)
      .cookie("authToken", token, {
        httpOnly: true,
        secure: process.env.SECURE !== "development",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: "strict",
      })
      .json({ msg: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Login
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: "Please fill all fields" });
  }

  try {
        const user = await User.findOne({
      $or: [{ email: username }, { username: username }],
    });

    if (!user) {
      return res.status(404).json({ msg: "User doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, username: user.username },
      process.env.JWT_TOKEN,
      { expiresIn: "1d" }
    );
 
    user.password = undefined;

    res
      .status(200)
      .cookie("authToken", token, {
        httpOnly: true,
        secure: process.env.SECURE !== "development",
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "strict",
      })
      .json({ msg: "Login successful", user , token });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

const userLogout = async (req, res)=>{
  try {
    res.cookie("authToken","",{
      maxAge: 0,
    })
    res.status(200).json({ msg: "User Logged out Successfully"})
  } catch (error) {
    res.status(500).json({ msg : 'Server Error', error: error.message})
  }
}

//!profile upload 
const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No image uploaded" });
    }

    // Wrap cloudinary stream in a promise
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "chat-profiles" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(buffer); // Important
      });
    };

    const result = await streamUpload(req.file.buffer);

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { profile: result.secure_url },
      { new: true }
    ).select("-password");

    res.status(200).json({ msg: "Image uploaded successfully", user: updatedUser });
  } catch (error) {
    console.error("Profile Upload Error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};


//remove photo 
const removeProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ msg: "User not found" });

    const defaultProfile =
      user.gender === "male"
        ? `https://robohash.org/${user.username}?set=set1`
        : `https://robohash.org/${user.username}?set=set2`;

    user.profile = defaultProfile;
    await user.save();

    user.password = undefined;
    res.status(200).json({ msg: "Profile image removed", user });

  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};



export { registerUser, loginUser ,userLogout,updateProfileImage ,removeProfileImage};
