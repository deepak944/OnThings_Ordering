require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const helmet = require('helmet');
const morgan = require('morgan');
const { spawn } = require('child_process');
const path = require('path');

const { sequelize } = require('./models');
const { ensureUserPasswordResetColumns } = require('./utils/schema');
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

  if (!fs.existsSync(scriptPath)) {
    console.warn(`AUTO_START_CHATBOT is true but chatbot script was not found at: ${scriptPath}`);
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

const formatErrorForLog = (error) => {
  if (!error) {
    return 'Unknown error';
  }

  if (error.stack) {
    return error.stack;
  }

  if (error.message) {
    return error.message;
  }

  try {
    return JSON.stringify(error);
  } catch (_jsonError) {
    return String(error);
  }
};

const logDockerAccessInfo = () => {
  const frontendUrl = process.env.PUBLIC_FRONTEND_URL;
  const apiUrl = process.env.PUBLIC_API_URL;
  const healthUrl = process.env.PUBLIC_HEALTH_URL;
  const dbHost = process.env.PUBLIC_DB_HOST;
  const dbPort = process.env.PUBLIC_DB_PORT;
  const dbName = process.env.PUBLIC_DB_NAME;
  const dbUser = process.env.PUBLIC_DB_USER;

  const lines = [
    'App links:',
    frontendUrl ? `  Frontend: ${frontendUrl}` : null,
    apiUrl ? `  API: ${apiUrl}` : null,
    healthUrl ? `  Health: ${healthUrl}` : null,
    dbHost && dbPort ? `  MySQL: mysql://${dbUser || 'user'}@${dbHost}:${dbPort}/${dbName || ''}` : null
  ].filter(Boolean);

  if (lines.length > 1) {
    console.log(lines.join('\n'));
  }
};

const start = async () => {
  try {
    await sequelize.authenticate();

    const autoSync = String(process.env.AUTO_SYNC_DB || 'false') === 'true';
    if (autoSync) {
      // Use 'force: false' to prevent dropping tables, and 'alter: false' to prevent schema changes
      await sequelize.sync({ force: false, alter: false });
    }

    await ensureUserPasswordResetColumns(sequelize);

    startChatbotProcess();

    const port = Number(process.env.PORT || 5000);
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      logDockerAccessInfo();
    });
  } catch (error) {
    console.error('Failed to start backend:', formatErrorForLog(error));
    process.exit(1);
  }
};

start();
