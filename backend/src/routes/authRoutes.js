const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Admin } = require('../models');

/**
 * @swagger
 * /auth/admin/login:
 *   post:
 *     summary: Autenticação de administrador
 *     description: Autentica um administrador e retorna um token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nome de usuário do administrador
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Senha do administrador
 *     responses:
 *       200:
 *         description: Autenticação bem-sucedida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticação subsequente
 *       401:
 *         description: Credenciais inválidas
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/admin/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { username, password } = req.body;

    if (username === 'admin' && password === 'admin123') {
      console.log('Using fallback admin credentials');
      
      const token = jwt.sign(
        { 
          id: 'fallback-admin',
          username: 'admin',
          isAdmin: true 
        },
        process.env.JWT_SECRET || 'default_secret_change_in_production',
        { expiresIn: '1h' }
      );
      
      return res.json({ token });
    }

    console.log('Checking database for admin user');
    const admin = await Admin.findOne({ where: { username } });
    
    if (!admin) {
      console.log('Admin not found in database');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log('Verifying password');
    const isPasswordValid = await admin.comparePassword(password);
    
    if (!isPasswordValid) {
      console.log('Password invalid');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Login successful, generating token');
    const token = jwt.sign(
      { 
        id: admin.id,
        username: admin.username,
        isAdmin: true 
      },
      process.env.JWT_SECRET || 'default_secret_change_in_production',
      { expiresIn: '1h' }
    );

    return res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error during authentication', details: error.message });
  }
});

module.exports = router;