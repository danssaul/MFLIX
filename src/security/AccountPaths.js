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
    authentication: () => false,
    authorization: () => true
  }
};

export default AccountPaths;