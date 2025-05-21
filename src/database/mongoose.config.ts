// Initial implementation for MongooseConfig
export const mongooseConfig = {
  uri: process.env.MONGO_URI,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
};