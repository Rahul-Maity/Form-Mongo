const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
mongoose.connect("mongodb://localhost:27017/Form", (err, db) => {

    if (err) {
        console.log(`Database not connected :   ${err}`)
    } else {
        console.log('Database connected Successfully')
    }
});