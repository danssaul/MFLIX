import dotenv from "dotenv";
dotenv.config();

const MoviesPaths = {
  GET: {
    authentication: () => 'jwt',
    authorization: (req) => {
      return req.role !== 'admin';
    }
  },
  POST: {
    authentication: () => 'jwt',
    authorization: (req) => {
      return req.role !== 'admin';
    }
  },
  PATCH: {
    authentication: () => 'jwt',
    authorization: (req) => {
      return req.role === 'premium_user';
    }
  }
};

export default MoviesPaths;