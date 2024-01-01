class  BlogDTO {
    constructor(blog){
        this._id = blog._id;
        this.title = blog.title;
        this.content = blog.content;
        this.photo = blog.photoUrl;
        this.author = blog.author;
        this.slug = blog.slug;
        this.createdAt = blog.createdAt;
    }
}

module.exports = BlogDTO;