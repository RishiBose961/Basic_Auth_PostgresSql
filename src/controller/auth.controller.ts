import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

export const signup = async (req: Request, res: Response) => {
  try {
    const { fullname, username, gender, email, password, confirmPassword } =
      req.body;

    if (
      !fullname ||
      !username ||
      !gender ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if username or email already exists in the database
    // If it does, return an error

    const user = await prisma.user.findUnique({ where: { username } });

    if (user) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        fullname,
        username,
        gender,
        email,
        password: hashedPassword,
      },
    });

    if (newUser) {
      generateToken(newUser.id, res);
      res.status(201).json({
        message: "User created successfully",
        user: {
          id: newUser.id,
          fullname: newUser.fullname,
          username: newUser.username,
          email: newUser.email,
        },
      });
    } else {
      res.status(400).json({ message: "Failed to create user" });
    }
  } catch (error: any) {
    res.status(500).json(error.message);
  }
};
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    generateToken(user.id, res);

    res.status(200).json({
      id: user.id,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
    });
  } catch (error: any) {
    res.status(500).json(error.message);
  }
};
export const logout = async (req: Request, res: Response) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const Profile = async (req: Request, res: Response) => {
	try {
		const user = await prisma.user.findUnique({ where: { id: req.user.id } });

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		res.status(200).json({
		  id: user.id,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
		});
	} catch (error: any) {
		console.log("Error in getMe controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
