const { default: mongoose } = require("mongoose");
const { DB_NAME } = require("../constants");

const connectDB = async () => {
    console.log(
        `Connecting to database ${DB_NAME} using Mongoose...`
    );
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}?retryWrites=true&w=majority`);
        console.log(`\nMongoDB connected !! DB HOST : ${connectionInstance.connection.host} \n`);
    } catch (error) {
        console.error("MongoDB connection error !!! ", error);
    }
}

module.exports = {connectDB}; 