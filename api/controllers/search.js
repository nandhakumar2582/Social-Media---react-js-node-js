import { db } from '../connect.js';

export const search = ('/search', (req, res) => {
    const searchTerm = req.query.q; 
    console.log(searchTerm);
    const searchQuery = "SELECT * FROM users WHERE username LIKE ? OR name LIKE ?";
    const searchValue = `%${searchTerm}%`; 
    db.query(searchQuery, [searchValue, searchValue], (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);}
        res.status(200).json(data);
    });
});

