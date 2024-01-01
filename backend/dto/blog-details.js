class BlogDetailsDTO {
    constructor(blog){
        this._id = blog._id;
        this.title = blog.title;
        this.content = blog.content;
        this.photo = blog.photoUrl;
        this.slug = blog.slug;
        this.authorName = blog.author.name;
        this.authorUsername = blog.author.username;
        this.createdAt = blog.author.createdAt;
    }
}

module.exports = BlogDetailsDTO;
