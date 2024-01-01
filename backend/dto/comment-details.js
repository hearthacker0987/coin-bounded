class CommentDTO {
    constructor(comment){
        this._id = comment._id;
        this.content = comment.content;
        this.blogId = comment.blogId;
        this.authorName = comment.author.name;
        this.authorUsername = comment.author.username;
        this.createdAt = comment.createdAt;  
    }
}

module.exports = CommentDTO;