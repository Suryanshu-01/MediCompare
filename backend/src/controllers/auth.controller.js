import User from "../models/user.model.js";
import Hospital from "../models/hospital.model.js";

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "User Info not present",
      });
    }
    const existedUser = await User.findOne({ email });
    if (existedUser) {
      return res.status(409).json({
        success: false,
        message: "User already exits",
      });
    }
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: "USER",
    });
    if(!user){
      console.log("User not created");
      return res.status(402).json({
        success:false,
        message:"user not created"
      })
    }

    const token = user.generateJWT();
    res.status(200).json({
      success: true,
      message: "New user created",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server error occur"});
  }
};

const registerHospital = async (req, res) => {
  try {
    const { hospitalName, email, phone, address, longitude, latitude } =
      req.body;

    if (
      !hospitalName ||
      !email ||
      !phone ||
      !address ||
      !longitude ||
      !latitude ||
      !req.file
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter all the info",
      });
    }

    const existedHospital = await Hospital.findOne({ email });

    if (existedHospital) {
      {
        return res.status(409).json({
          success: false,
          message: "User already existed",
        });
      }
    }

    const user = await User.create({
      name: hospitalName,
      email,
      password,
      phone,
    });

    await Hospital.create({
      name: hospitalName,
      email,
      phone,
      address,

      location: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
      },
      document: {
        url: req.file.path,
        publicId: req.file.filename,
      },
      status: "PENDING",
    });
    return res.status(409).json({
      success: false,
      message: "User already existed",
    });
  } catch (error) {
    console.log("Error Came");
    return res.status(500).json({
      success: false,
      message: "Server error occur",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter all the info",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return res.status(201).json({
        success: false,
        message: "Enter the correct password",
      });
    }

    if (user.role == "HOSPITAL") {
      const hospital = await Hospital.findOne({ userId: user.id });

      if (!hospital || hospital.status !== "VERIFIED") {
        return res.status(409).json({
          success: false,
          message: "Hospital is not verifired by user",
        });
      }
    }
    const token = user.generateJWT();

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("Internal server error  occur");
    return res.status(500).json({
      success: false,
      message: "Internal Server error occur",
    });
  }
};

export {
  login,
  registerHospital,
  registerUser,
}
