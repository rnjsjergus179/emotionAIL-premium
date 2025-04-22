const User = require('../models/user.model');

const subscribeUser = async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: '이름과 이메일이 필요합니다.' });
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        subscribed: true,
        startDate: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1년 후
      });
    } else {
      user.name = name;
      user.subscribed = true;
      user.startDate = new Date();
      user.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1년 후
    }

    await user.save();
    res.status(200).json({ message: '구독 정보가 저장되었습니다.' });
  } catch (error) {
    console.error(`구독 정보 저장 중 오류: ${error.message}`);
    res.status(500).json({ message: '서버 오류' });
  }
};

const checkSubscription = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: '이메일이 필요합니다.' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const currentDate = new Date();
    if (user.expiresAt && user.expiresAt < currentDate) {
      user.subscribed = false;
      await user.save();
      console.log(`사용자 ${email}의 구독이 만료되어 subscribed를 false로 업데이트했습니다.`);
    }

    res.json({ subscribed: user.subscribed });
  } catch (error) {
    console.error(`구독 상태 확인 중 오류: ${error.message}`);
    res.status(500).json({ message: '서버 오류' });
  }
};

module.exports = { subscribeUser, checkSubscription };
