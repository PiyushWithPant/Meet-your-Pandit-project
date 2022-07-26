const CustomError = require('../errors')
const { isTokenValid } = require('../utils')


const authenticateUser = async (req, res, next) => {
    const token = req.signedCookies.token
    if (!token) {
        res.redirect('/login');
        throw new CustomError.UnauthenticatedError('Authentication Invalid')
    }

    try {
        const { name, userId, role } = isTokenValid({ token })
        req.user = { name, userId, role }
        // console.log(userId);
        next();
    } catch (error) {
        res.redirect('/login');
        throw new CustomError.UnauthenticatedError('Invalid Authentication')
    }
}

const authorizePermissions = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new CustomError.UnauthorizedError('Unauthorized to access this route')
        }
        next()
    }
}

module.exports = {
    authenticateUser,
    authorizePermissions,
}