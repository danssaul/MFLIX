import dotenv from "dotenv";
dotenv.config();

const AccountPaths = {
  POST: {
    authentication: (req) => {
      if (req.path === '/admin') {
        return 'basic';
      }
      return false;
    },
    authorization: (req) => {
      if (req.path === '/admin') {
        return req.user === process.env.ADMIN_EMAIL;
      }
      return true;
    }
  },
  GET: {
    authentication: () => 'jwt',
    authorization: (req) => {
      return req.user === process.env.ADMIN_EMAIL || req.user === req.params.email;
    }
  },
  PATCH: {
    authentication: () => 'jwt',
    authorization: (req) => {
      if (req.path.includes('/password')) {
        return req.user === process.env.ADMIN_EMAIL || req.user === req.params.email;
      } else if (req.path.includes('/roles')) {
        return req.user === process.env.ADMIN_EMAIL;
      } else if (req.path.includes('/block')) {
        return req.user === process.env.ADMIN_EMAIL;
      }
      return false;
    }
  },
  DELETE: {
    authentication: () => 'jwt',
    authorization: (req) => {
      return req.user === process.env.ADMIN_EMAIL || req.user === req.params.email;
    }
  }
};

export default AccountPaths;