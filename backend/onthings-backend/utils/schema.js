const { DataTypes } = require('sequelize');

const ensureUserPasswordResetColumns = async (sequelize) => {
  const queryInterface = sequelize.getQueryInterface();

  let tableDefinition;
  try {
    tableDefinition = await queryInterface.describeTable('users');
  } catch (_error) {
    return;
  }

  if (!tableDefinition.reset_password_token) {
    await queryInterface.addColumn('users', 'reset_password_token', {
      type: DataTypes.STRING(64),
      allowNull: true
    });
  }

  if (!tableDefinition.reset_password_expires_at) {
    await queryInterface.addColumn('users', 'reset_password_expires_at', {
      type: DataTypes.DATE,
      allowNull: true
    });
  }
};

module.exports = { ensureUserPasswordResetColumns };
