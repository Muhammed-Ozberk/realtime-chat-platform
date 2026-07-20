module.exports = (sequelize, DataTypes) => {
    var Users = sequelize.define('Users',
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            userID: DataTypes.STRING,
            username: DataTypes.STRING,
            email: DataTypes.STRING,
            password: DataTypes.STRING,
            themeMode: {
                type: DataTypes.STRING,
                defaultValue: 'light'
            },
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        }
    );

    return Users;
};
