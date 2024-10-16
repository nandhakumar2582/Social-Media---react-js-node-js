import bcrypt from 'bcryptjs';
import { db } from '../connect.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const register = (req, res) => {
    // check if user already exists
    const q = "SELECT * FROM users WHERE username = ?";

    db.query(q, [req.body.username], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length) return res.status(409).json("User already exists!");

        // hash the password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(req.body.password, salt);

        // insert user data into the database
        const insertQuery = "INSERT INTO users (`username`, `email`, `password`, `name`) VALUES (?, ?, ?, ?)";
        const values = [req.body.username, req.body.email, hashedPassword, req.body.name];

        db.query(insertQuery, values, (err, data) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json("User has been created");
        });
    });
};

export const login = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ 'message': 'Username and Password are required' });

    const q = "SELECT * FROM users WHERE username = ?";
    db.query(q, [req.body.username], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.sendStatus(401);

        const checkPassword = bcrypt.compareSync(req.body.password, data[0].password);
        if (!checkPassword) return res.status(400).json({ 'message': 'Wrong password or username!' });

        // generate access token
        const accessToken = jwt.sign({ id: data[0].id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

        // generate refresh token
        const refreshToken = jwt.sign({ id: data[0].id }, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'});

        // store refresh token in database
        const insertRefreshTokenQuery = "INSERT INTO refresh_tokens (`user_id`, `refresh_token`) VALUES (?, ?)";
        db.query(insertRefreshTokenQuery, [data[0].id, refreshToken], (err, result) => {
            if (err) return res.status(500).json(err);

            // send access token and refresh token as cookies
            res.cookie("accessToken", accessToken, { httpOnly: true });
            res.cookie("refreshToken", refreshToken, { httpOnly: true });

            // send user data without password
            const { password, ...others } = data[0];
            res.status(200).json(others);
        });
    });
};

export const logout = (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "No refresh token found" });

    // remove refresh token from database
    const deleteRefreshTokenQuery = "DELETE FROM refresh_tokens WHERE refresh_token = ?";
    db.query(deleteRefreshTokenQuery, [refreshToken], (err, result) => {
        if (err) return res.status(500).json(err);

        // clear cookies
        res.clearCookie("accessToken", { secure: true, sameSite: "none" });
        res.clearCookie("refreshToken", { secure: true, sameSite: "none" });

        res.status(200).json("User has been logged out.");
    });
};

export const refreshAccessToken = (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "No refresh token found" });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid refresh token" });

        // generate new access token
        const accessToken = jwt.sign({ id: decoded.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

        // send new access token as cookie
        res.cookie("accessToken", accessToken, { httpOnly: true });

        res.status(200);
    });
};
