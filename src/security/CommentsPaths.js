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
        return false;
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
        return false;
      }
    }
  }
};

export default CommentsPaths;