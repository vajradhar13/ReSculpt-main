"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.authCheck = exports.resetPassword = exports.profile = exports.forgotPassword = exports.signin = exports.signup = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const resculpt_1 = require("@abhiram2k03/resculpt");
const email_1 = require("../utils/email");
const prisma = new client_1.PrismaClient();
const User = prisma.user;
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password, cPassword } = resculpt_1.signupSchema.parse(req.body);
        if (password !== cPassword) {
            return res.json({ msg: "Passwords do not match" });
        }
        const user = yield User.findFirst({
            where: {
                email
            }
        });
        if (user) {
            return res.status(400).json({ msg: "User already exists" });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const saveUser = yield User.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        });
        const token = jsonwebtoken_1.default.sign({ userId: saveUser.id }, process.env.JWT_SECRET);
        res.cookie('token', token, { httpOnly: true });
        return res.status(201).json({ msg: "User created Successfully", token });
    }
    catch (error) {
        // If validation fails, return error message
        if (error.errors && error.errors[0].message) {
            const message = error.errors[0].message;
            return res.json({ msg: message });
        }
        // For any other errors, print "Internal Server Error"
        console.error(error); // Log the error for debugging purposes
        return res.json({ msg: "Internal Server Error" });
    }
});
exports.signup = signup;
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = resculpt_1.signinSchema.parse(req.body);
        const user = yield User.findFirst({
            where: {
                email
            }
        });
        if (!user) {
            return res.json({ msg: "Email doesn't exist" });
        }
        const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            return res.json({ msg: "Invalid Credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET);
        res.cookie('token', token, { httpOnly: true });
        return res.status(200).json({ msg: "Signin successful", token });
    }
    catch (error) {
        // If validation fails, return error message
        if (error.errors && error.errors[0].message) {
            const message = error.errors[0].message;
            return res.json({ msg: message });
        }
        // For any other errors, print "Internal Server Error"
        console.error(error); // Log the error for debugging purposes
        return res.status(500).json({ msg: "Internal Server Error" });
    }
});
exports.signin = signin;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = resculpt_1.forgotPasswordSchema.parse(req.body);
        const existingUser = yield User.findFirst({
            where: {
                email
            }
        });
        if (!existingUser) {
            return res.status(404).json({ msg: "User not found" });
        }
        // Generate token
        const token = jsonwebtoken_1.default.sign({ userId: existingUser.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.cookie('token', token, { httpOnly: true });
        const text = `'http://localhost:5173/resetPassword/${token}`;
        const emailResult = yield (0, email_1.sendEmail)(email, "Reset password", text);
        // Send email
        if (emailResult.success) {
            return res.status(200).json({ msg: "Email sent successfully" });
        }
        else {
            return res.status(400).json({ msg: emailResult.error });
        }
    }
    catch (error) {
        // If validation fails, return error message
        if (error.errors && error.errors[0].message) {
            const message = error.errors[0].message;
            return res.status(400).json({ msg: message });
        }
        // For any other errors, print "Internal Server Error"
        console.error(error); // Log the error for debugging purposes
        return res.status(500).json({ msg: "Internal Server Error" });
    }
});
exports.forgotPassword = forgotPassword;
const profile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }
        return res.json({ username: user.username, email: user.email });
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});
exports.profile = profile;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { password, cPassword } = resculpt_1.resetPasswordSchema.parse(req.body);
        const user = req.user;
        console.log('User object before update:', user); // Log the user object
        if (!user) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }
        if (password !== cPassword) {
            return res.status(400).json({ msg: "Passwords do not match" });
        }
        // Hash the password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        console.log('Hashed password:', hashedPassword); // Log the hashed password
        // Update the user's password in the database
        yield User.update({ where: { id: user.id }, data: { password: hashedPassword } });
        // Fetch the updated user object
        const updatedUser = yield User.findUnique({ where: { id: user.id } });
        console.log('Updated user object:', updatedUser); // Log the updated user object
        return res.status(200).json({ msg: 'Password updated successfully', user: updatedUser });
    }
    catch (error) {
        // If validation fails, return error message
        if (error.errors && error.errors[0].message) {
            const message = error.errors[0].message;
            return res.json({ msg: message });
        }
        // For any other errors, print "Internal Server Error"
        console.error(error); // Log the error for debugging purposes
        return res.json({ msg: "Internal Server Error" });
    }
});
exports.resetPassword = resetPassword;
const authCheck = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return res.status(200).json({ isAuthenticated: true });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json("Internal Server Error");
    }
});
exports.authCheck = authCheck;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie('token');
    return res.status(200).json({ msg: "Logged out successfully" });
});
exports.logout = logout;
