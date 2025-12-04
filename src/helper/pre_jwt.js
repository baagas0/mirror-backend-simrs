const jwt = require( 'jsonwebtoken' )

// const rahasia = process.env.PRE_SECRET
const rahasia = 'disiniditya'

function generateToken( payload ) {
	return jwt.sign( payload, rahasia , {
		expiresIn: '15s' // expire di 15 detik
   })
}

function verifyToken( token ) {
	console.log('PRE '+rahasia)
	return jwt.verify( token, rahasia )
}

module.exports = {generateToken,verifyToken}
