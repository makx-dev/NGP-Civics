const express = require('express');
const bcrypt = require('bcryptjs');
let OAuth2Client;
try {
  ({ OAuth2Client } = require('google-auth-library'));
} catch (_err) {
  // Fallback to fetch tokeninfo if google-auth-library is not installed
}
const User = require('../models/User');
const Admin = require('../models/Admin');
const { signToken } = require('../utils/token');
const { authLimiter } = require('../middleware/rateLimiters');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(authLimiter);

const getAllowedGoogleAudiences = () => {
  const audiences = [
    process.env.GOOGLE_CLIENT_ID,
    process.env.VITE_GOOGLE_CLIENT_ID,
    '658984037649-hfte97l34jn5qtjgk0jok5p86ruk2562.apps.googleusercontent.com',
  ].filter(Boolean);
  return Array.from(new Set(audiences));
};

const verifyGoogleToken = async (idToken) => {
  const allowedAudiences = getAllowedGoogleAudiences();
  let payload = null;
  let verificationError = null;

  // Attempt 1: verify using google-auth-library if available
  if (OAuth2Client) {
    try {
      const client = new OAuth2Client();
      const ticket = await client.verifyIdToken({
        idToken,
        audience: allowedAudiences.length === 1 ? allowedAudiences[0] : allowedAudiences,
      });
      payload = ticket.getPayload();
    } catch (err) {
      verificationError = err;
      console.warn('OAuth2Client.verifyIdToken failed, attempting tokeninfo fallback:', err.message);
    }
  }

  // Attempt 2: fallback to Google's tokeninfo API endpoint
  if (!payload) {
    try {
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
      );
      if (response.ok) {
        const data = await response.json();
        const matchesAudience =
          allowedAudiences.length === 0 || allowedAudiences.includes(data.aud);
        if (matchesAudience && data.email) {
          payload = {
            sub: data.sub,
            email: data.email,
            name: data.name || data.given_name || '',
            picture: data.picture || '',
          };
        } else if (!matchesAudience) {
          throw new Error(`Token audience (${data.aud}) is not authorized.`);
        }
      } else {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error_description || errJson.error || 'Google tokeninfo check failed');
      }
    } catch (fallbackErr) {
      console.error('Google tokeninfo fallback error:', fallbackErr.message);
      throw verificationError || fallbackErr;
    }
  }

  if (!payload || !payload.email) {
    throw new Error('Invalid Google token payload or missing email address.');
  }

  return payload;
};

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body || {};
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    const payload = await verifyGoogleToken(credential);
    const { sub: googleId, email, name, picture } = payload;
    const normalizedEmail = (email || '').toLowerCase().trim();

    if (!normalizedEmail) {
      return res.status(400).json({ message: 'No valid email found in Google profile' });
    }

    // Find existing user by googleId or email
    let user = await User.findOne({
      $or: [
        ...(googleId ? [{ googleId }] : []),
        { email: normalizedEmail },
      ],
    });

    if (user) {
      const updates = {};
      if (googleId && user.googleId !== googleId) {
        updates.googleId = googleId;
      }
      if (picture && !user.avatar) {
        updates.avatar = picture;
      }
      if (name && (!user.name || user.name === 'Citizen')) {
        const safeName = name.trim().slice(0, 80);
        if (safeName.length >= 2) {
          updates.name = safeName;
        }
      }

      if (Object.keys(updates).length > 0) {
        user = await User.findByIdAndUpdate(
          user._id,
          { $set: updates },
          { new: true }
        );
      }
    } else {
      let safeName = (name || '').trim();
      if (safeName.length < 2) {
        const prefix = (normalizedEmail.split('@')[0] || '').trim();
        safeName = prefix.length >= 2 ? prefix : 'Citizen';
      }
      if (safeName.length > 80) {
        safeName = safeName.slice(0, 80);
      }

      user = await User.create({
        name: safeName,
        email: normalizedEmail,
        googleId: googleId || null,
        avatar: picture || '',
      });
    }

    const token = signToken({ id: user._id, role: 'user' });
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        language: user.language || '',
        avatar: user.avatar || '',
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    return res.status(401).json({
      message: error.message || 'Google authentication failed. Please try again.',
    });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, phone });

    const token = signToken({ id: user._id, role: 'user' });
    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        language: user.language || '',
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password || '', user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken({ id: user._id, role: 'user' });
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        language: user.language || '',
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    const admin = await Admin.findOne({ email: (email || '').toLowerCase() });
    if (!admin || !admin.passwordHash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password || '', admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken({ id: admin._id, role: 'admin' });
    return res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/me', protect('user'), async (req, res) => {
  try {
    const user = await User.findById(req.auth.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        language: user.language || '',
        avatar: user.avatar || '',
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.patch('/profile', protect('user'), async (req, res) => {
  try {
    const { name, phone, address, language } = req.body || {};
    const updates = {};
    if (typeof name === 'string' && name.trim()) updates.name = name.trim();
    if (typeof phone === 'string') updates.phone = phone.trim();
    if (typeof address === 'string') updates.address = address.trim();
    if (typeof language === 'string') updates.language = language.trim();

    const user = await User.findByIdAndUpdate(
      req.auth.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        language: user.language || '',
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/change-password', protect('user'), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.auth.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {};
    const normalizedEmail = (email || '').toLowerCase().trim();

    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address.' });
    }

    // Generate secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 8);

    user.resetPasswordToken = hashedOtp;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // Valid for 15 minutes
    await user.save();

    console.log(`[NGP-Civics Password Reset] Verification code for ${normalizedEmail}: ${otp}`);

    return res.json({
      message: 'Password reset code generated successfully.',
      otp, // Included for local demo/testing convenience
      expiresInMinutes: 15,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: error.message || 'Failed to generate reset code.' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body || {};
    const normalizedEmail = (email || '').toLowerCase().trim();
    const cleanOtp = String(otp || '').trim();

    if (!normalizedEmail || !cleanOtp || !newPassword) {
      return res.status(400).json({ message: 'Email, reset code, and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const user = await User.findOne({
      email: normalizedEmail,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user || !user.resetPasswordToken) {
      return res.status(400).json({ message: 'Invalid or expired reset code. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(cleanOtp, user.resetPasswordToken);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect reset code. Please verify and try again.' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({ message: 'Your password has been reset successfully. You can now sign in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: error.message || 'Failed to reset password.' });
  }
});

module.exports = router;
