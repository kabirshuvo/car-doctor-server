const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express());

app.get('/', (req, res)=>{
    res.send('Car Doctor Server is Running')
})






app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})