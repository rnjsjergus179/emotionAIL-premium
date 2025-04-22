const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB에 연결되었습니다.');
  } catch (error) {
    console.error(`MongoDB 연결 실패: ${error.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
