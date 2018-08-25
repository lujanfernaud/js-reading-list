class LibraryController {
  constructor(app) {
    this.app = app
  }

  addCollection(books) {
    books.forEach(book => this.app.library.add(book))
    this.app.libraryView.render()
  }

  add(book) {
    this.app.library.add(book)
    this.app.libraryView.render()
  }
}

export { LibraryController }
