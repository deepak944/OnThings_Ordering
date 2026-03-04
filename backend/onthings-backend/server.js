require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { spawn } = require('child_process');
const path = require('path');

const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();
let chatbotProcess = null;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true
  })
);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/chatbot', chatbotRoutes);

app.use((req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

app.use(errorMiddleware);

const startChatbotProcess = () => {
  const shouldAutoStart = String(process.env.AUTO_START_CHATBOT || 'false') === 'true';
  if (!shouldAutoStart) {
    return;
  }

  const scriptPath = process.env.CHATBOT_SCRIPT_PATH;
  if (!scriptPath) {
    console.warn('AUTO_START_CHATBOT is true but CHATBOT_SCRIPT_PATH is not configured.');
    return;
  }

  const pythonCmd = process.env.CHATBOT_PYTHON_CMD || 'py';
  chatbotProcess = spawn(pythonCmd, [scriptPath], {
    cwd: path.dirname(scriptPath),
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  chatbotProcess.stdout.on('data', (chunk) => {
    const line = String(chunk).trim();
    if (line) {
      console.log(`[chatbot] ${line}`);
    }
  });

  chatbotProcess.stderr.on('data', (chunk) => {
    const line = String(chunk).trim();
    if (line) {
      console.error(`[chatbot:error] ${line}`);
    }
  });

  chatbotProcess.on('close', (code) => {
    console.log(`[chatbot] process exited with code ${code}`);
    chatbotProcess = null;
  });

  chatbotProcess.on('error', (error) => {
    console.error(`[chatbot] failed to start: ${error.message}`);
    chatbotProcess = null;
  });
};

const stopChatbotProcess = () => {
  if (chatbotProcess && !chatbotProcess.killed) {
    chatbotProcess.kill();
  }
};

process.on('SIGINT', () => {
  stopChatbotProcess();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopChatbotProcess();
  process.exit(0);
});

const start = async () => {
  try {
    await sequelize.authenticate();

    const autoSync = String(process.env.AUTO_SYNC_DB || 'false') === 'true';
    if (autoSync) {
      // Use 'force: false' to prevent dropping tables, and 'alter: false' to prevent schema changes
      await sequelize.sync({ force: false, alter: false });
    }

    startChatbotProcess();

    const port = Number(process.env.PORT || 5000);
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start backend:', error.message);
    process.exit(1);
  }
};

start();
