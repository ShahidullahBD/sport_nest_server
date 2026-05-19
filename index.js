const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();

app.use(cors());
app.use(express.json());

dotenv.config();

const PORT = process.env.PORT || 5000;


app.get('/', (req, res)=>{
    res.send('Server is running Fine!')
})

app.listen(PORT, ()=>{
    console.log(`Server running on PORT: ${PORT}`);
})