const STATUS_INDEX = 2

class App {
  constructor() {
    this.library = new Library()
    this.bookAppender = new BookAppender(this)
    this.form = new Form(this)
  }

  start() {
    this.populateTable()
    this.form.watchSubmitButton()
  }

  populateTable() {
    const books = new Seeds().books

    books.forEach(book => {
      this.bookAppender.call(book)
    })
  }

  deleteBook(event) {
    const row = event.target.parentNode.parentNode
    const tbody = row.parentNode

    return tbody.removeChild(row)
  }
}

class Seeds {
  constructor() {
    this.books = [
      { title: 'Night Watch', author: 'Terry Pratchett', status: 'Not read' },
      { title: 'Night Watch', author: 'Terry Pratchett', status: 'Not read' }
    ]
  }
}

class Library {
  constructor() {
    this.books = []
  }
}

class BookAppender {
  constructor(app) {
    this.app = app
    this.libraryBooks = app.library.books
  }

  call(book) {
    this.createNewRow()

    Object.values(book).forEach((value, index) => {
      if (index !== STATUS_INDEX) {
        this.addCell(value)
      } else {
        this.addButton(value)
      }
    })

    this.addButton('Delete', { id: 'delete' })

    return this.libraryBooks.push(book)
  }

  createNewRow() {
    this.tableBody = document.getElementById('table-body')
    this.tr = document.createElement('tr')
    this.tableBody.appendChild(this.tr)
  }

  addCell(value) {
    const text = document.createTextNode(value)
    const td = document.createElement('td')

    td.appendChild(text)
    this.tr.appendChild(td)
  }

  addButton(value, { id = '' } = {}) {
    const text = document.createTextNode(value)
    const td = document.createElement('td')
    const button = document.createElement('button')
    button.id = id

    if (id === 'delete') {
      button.onclick = this.app.deleteBook
    }

    button.appendChild(text)
    td.appendChild(button)
    this.tr.appendChild(td)
  }
}

class Form {
  constructor(app) {
    this.app = app
    this.title = document.getElementById('form-input-title').value
    this.author = document.getElementById('form-input-author').value
    this.status = document.getElementById('form-select').value
    this.submitButton = document.getElementById('submit')
  }

  watchSubmitButton() {
    this.submitButton.addEventListener('click', (event) => {
      event.preventDefault()

      this.submitBook()
    })
  }

  submitBook() {
    const book = new Book(this.title, this.author, this.status)

    return this.app.bookAppender.call(book)
  }
}

class Book {
  constructor(title, author, status) {
    this.title = title
    this.author = author
    this.status = status
  }
}

const app = new App().start()