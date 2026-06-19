// Google login
router.post('/google', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name: name || email.split('@')[0],
        email,
        password: Math.random().toString(36) + Math.random().toString(36),
        googleAuth: true,
      });
      await user.save();
    }

    const token = generateToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Google login failed' });
  }
});
