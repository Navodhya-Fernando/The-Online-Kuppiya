const express = require('express');
const { connectDB } = require('./config/index');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();
const port = process.env.PORT || 5000;

const resourceRoutes = require('./routes/resource.route'); 
const authRoutes = require('./routes/auth.route'); 

connectDB(); 

app.use(express.json()); 
app.use(express.urlencoded({ extended: false })); 

app.get('/', (req, res) => {
    res.send('Server is running for The Online Kuppiya!');
});

app.use('/api/resources', resourceRoutes); 
app.use('/api/auth', authRoutes);

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});