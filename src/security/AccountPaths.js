const AccountPaths = {
  POST: {
    authentication: (req) => {
      if (req.path.includes('/admin')) {
        return 'basic';
      }
      return false;
    },
    authorization: (req) => {
      if (req.path.includes('/admin')) {
        return req.user === process.env.ADMIN_EMAIL || req.role === 'admin';
      }
      return true;
    }
  },
  GET: {
    authentication: () => 'jwt',
    authorization: (req) => {
      return req.user === process.env.ADMIN_EMAIL || req.user === req.params.email || req.role === 'admin';
    }
  },
  PATCH: {
    authentication: () => 'jwt',
    authorization: (req) => {
      if (req.path.includes('/password')) {
        return req.user === process.env.ADMIN_EMAIL || req.user === req.params.email || req.role === 'admin';
      } else if (req.path.includes('/roles')) {
        return req.user === process.env.ADMIN_EMAIL || req.role === 'admin';
      } else if (req.path.includes('/block')) {
        return req.user === process.env.ADMIN_EMAIL || req.role === 'admin';
      } else if (req.path.includes('/unblock')) {
        return req.user === process.env.ADMIN_EMAIL || req.role === 'admin';
      }
      return false;
    }
  },
  DELETE: {
    authentication: () => 'jwt',
    authorization: (req) => {
      return req.user === process.env.ADMIN_EMAIL || req.user === req.params.email || req.role === 'admin';
    }
  }
};

export default AccountPaths;