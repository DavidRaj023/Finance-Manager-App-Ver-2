const mongoose = require('mongoose')

const db = 'finance-manager';
//const connectionURL = `mongodb://127.0.0.1:27017/${db}`;
const connectionURL = `mongodb+srv://Davidraj:MfZ9rJ8SeP6v535D@cluster01.mmams.mongodb.net/${db}?retryWrites=true&w=majority`

mongoose.connect(connectionURL, 
    {
        useNewUrlParser: true,
        // useCreateIndex: true,
        // useFindAndModify: false
    }
    ).then(console.log(`Connected to ${db} db Successfully..`))
    .catch(error => console.log(error));
