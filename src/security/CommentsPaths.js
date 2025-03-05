import commentService from "../service/CommentsService.js";

const CommentsPaths = {
  GET: {
    authentication: () => 'jwt',
    authorization: () => true
  },
  POST: {
    authentication: () => 'jwt',
    authorization: async (req) => {
      try {
        const comment = await commentService.getCommentById(req.body.id);
        return req.role === 'premium_user' && comment.email === req.user;
      } catch (error) {
        if (error.message === 'Comment not found') {
          return { authorized: false, status: 404, message: 'Comment not found' };
        }
        return { authorized: false, status: 500, message: 'Internal server error' };
      }
    }
  },
  DELETE: {
    authentication: () => 'jwt',
    authorization: async (req) => {
      try {
        const comment = await commentService.getCommentById(req.params.id);
        return req.role === 'admin' || (req.role === 'premium_user' && comment.email === req.user);
      } catch (error) {
        if (error.message === 'Comment not found') {
          return { authorized: false, status: 404, message: 'Comment not found' };
        }
        return { authorized: false, status: 500, message: 'Internal server error' };
      }
    }
  }
};

export default CommentsPaths;