const GOODREADS_URL = /(https:\/\/www.goodreads.com\/book\/show\/\d{3,7}\.\w{2,30})/g

class App {
  constructor() {
    this.library = new Library(this)
    this.localStorage = new LocalStorage()
    this.seeds = new Seeds(this)
    this.bookManager = new BookManager(this)
    this.modal = new Modal()
    this.form = new Form(this)
  }

  start() {
    this.populateTable()
    this.modal.watchButtons()
    this.form.watchSubmitButton()
  }

  populateTable() {
    if (localStorage.books && this.localStorage.booksNotEmpty()) {
      this.bookManager.addCollection(this.localStorage.books)
    } else {
      this.bookManager.addCollection(this.seeds.books.reverse())
    }
  }
}

class Seeds {
  constructor(app) {
    this.books = [
      {
        title: 'Night Watch',
        author: 'Terry Pratchett',
        url: 'https://www.goodreads.com/book/show/47989.Night_Watch',
        status: 'Not read'
      },
      {
        title: 'On the Shortness of Life',
        author: 'Seneca',
        url: 'https://www.goodreads.com/book/show/97412.On_the_Shortness_of_Life',
        status: 'Not read'
      },
      {
        title: 'Non Violent Communication',
        author: 'Marshall B. Rosenberg',
        url: 'https://www.goodreads.com/book/show/560861.Non_Violent_Communication',
        status: 'Read'
      },
      {
        title: 'As a Man Thinketh',
        author: 'James Allen',
        url: 'https://www.goodreads.com/book/show/81959.As_a_Man_Thinketh',
        status: 'Read'
      },
      {
        title: 'The War of Art',
        author: 'Steven Pressfield',
        url: 'https://www.goodreads.com/book/show/1319.The_War_of_Art',
        status: 'Read'
      },
      {
        title: 'The Creative Habit',
        author: 'Twyla Tharp',
        url: 'https://www.goodreads.com/book/show/254799.The_Creative_Habit',
        status: 'Read'
      },
      {
        title: 'Mindfulness in Plain English',
        author: 'Bhante Henepola Gunaratana',
        url: 'https://www.goodreads.com/book/show/64369.Mindfulness_in_Plain_English',
        status: 'Read'
      }
    ]
  }
}

class Form {
  constructor(app) {
    this.app = app
    this.titleInput = document.getElementById('form-input-title')
    this.authorInput = document.getElementById('form-input-author')
    this.submitButton = document.getElementById('submit')
  }

  watchSubmitButton() {
    this.submitButton.addEventListener('click', (event) => {
      event.preventDefault()

      this.submitBook()
    })
  }

  submitBook() {
    if (!this.titleInput.validity.valid || !this.authorInput.validity.valid) {
      return false
    }

    const title = this.titleInput.value
    const author = this.authorInput.value
    const url = document.getElementById('form-input-url').value
    const options = document.getElementById('form-select').options
    const status = options[options.selectedIndex].text

    const book = new Book(title, author, url, status)

    this.app.bookManager.add(book)

    this.app.modal.closeModal()
  }
}

class Book {
  constructor(title, author, url, status) {
    this.title = title
    this.author = author
    this.url = url
    this.status = status
  }
}

class BookManager {
  constructor(app) {
    this.app = app
  }

  addCollection(books) {
    books.forEach(book => { this.add(book) })
  }

  add(book) {
    this.app.library.add(book)

    this.createNewRow()
    this.addInformationToRow(book)
  }

  createNewRow() {
    this.tableBody = document.getElementById('table-body')
    this.tr = document.createElement('tr')
    this.tr.id = this.app.library.currentId
    this.tableBody.prepend(this.tr)
  }

  addInformationToRow(book) {
    this.addTitleCell(book)
    this.addNormalCell(book.author)
    this.addStatusButton(book)
    this.addDeleteButton(book)
  }

  addTitleCell(book) {
    if (book.url.match(GOODREADS_URL)) {
      this.addLinkCell(book)
    } else {
      this.addNormalCell(book.title)
    }
  }

  addLinkCell(book) {
    const td = document.createElement('td')
    const a = document.createElement('a')
    const text = document.createTextNode(book.title)

    a.href = book.url
    a.target = 'blank'

    a.appendChild(text)
    td.appendChild(a)
    this.tr.appendChild(td)
  }

  addNormalCell(value) {
    const td = document.createElement('td')
    const text = document.createTextNode(value)

    td.appendChild(text)
    this.tr.appendChild(td)
  }

  addStatusButton(book) {
    const td = document.createElement('td')
    const button = document.createElement('button')
    const text = document.createTextNode(book.status)

    button.bookLibrary = this.app.library
    button.book = book
    button.onclick = this.updateBookStatus

    button.appendChild(text)
    td.appendChild(button)
    this.tr.appendChild(td)
  }

  updateBookStatus(event) {
    const button = event.target.firstChild

    button.data = button.data === 'Not read' ? 'Read' : 'Not read'

    this.bookLibrary.update(this.book, { status: button.data })
  }

  addDeleteButton(book) {
    const td = document.createElement('td')
    const button = document.createElement('button')
    const text = document.createTextNode('Delete')

    button.bookLibrary = this.app.library
    button.book = book
    button.onclick = this.removeBook

    button.appendChild(text)
    td.appendChild(button)
    this.tr.appendChild(td)
  }

  removeBook(event) {
    const row = event.target.parentNode.parentNode
    const tbody = row.parentNode

    tbody.removeChild(row)

    this.bookLibrary.remove(this.book)
  }
}

class Library {
  constructor(app) {
    this.app = app
    this.books = []
    this.currentId = -1
  }

  add(book) {
    this.currentId += 1

    book.id = this.currentId

    this.books.push(book)

    this.updateLocalStorage()
  }

  remove(book) {
    const bookIndex = this.books.indexOf(book)

    this.books.splice(bookIndex, 1)

    this.updateLocalStorage()
  }

  update(book, { title = '', author = '', status = '' } = {}) {
    const bookIndex = this.books.indexOf(book)

    if (title !== '' && title !== book.title) {
      this.books[bookIndex].title = title
    }

    if (author !== '' && author !== book.author) {
      this.books[bookIndex].author = author
    }

    if (status !== '' && status !== book.status) {
      this.books[bookIndex].status = status
    }

    this.updateLocalStorage()
  }

  updateLocalStorage() {
    if (!this.app.localStorage.available()) { return }

    this.app.localStorage.updateBooks(this.books)
    this.app.localStorage.updateCurrentId(this.currentId)
  }
}

class LocalStorage {
  constructor() {
    this.books = this.setBooks()
  }

  setBooks() {
    if (this.available() && localStorage.getItem('books')) {
      return JSON.parse(localStorage.getItem('books'))
    } else {
      return []
    }
  }

  available() {
    try {
      var storage = window['localStorage']
      var x = '__storage_test__'
      storage.setItem(x, x)
      storage.removeItem(x)
      return true
    } catch (e) {
      return e instanceof DOMException && (
        // Everything except Firefox.
        e.code === 22 ||
        // Firefox.
        e.code === 1014 ||
        // Test name field too, because code might not be present
        // everything except Firefox.
        e.name === 'QuotaExceededError' ||
        // Firefox.
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // Acknowledge QuotaExceededError only if there's something already stored.
      storage.length !== 0
    }
  }

  booksNotEmpty() {
    return JSON.parse(localStorage.getItem('books')).length !== 0
  }

  updateBooks(books) {
    localStorage.setItem('books', JSON.stringify(books))
  }

  updateCurrentId(currentId) {
    localStorage.setItem('currentId', JSON.stringify(currentId))
  }
}

class Modal {
  constructor() {
    this.modal = document.getElementById('modal')
    this.backdrop = document.getElementById('modal-backdrop')
    this.openButtons = document.querySelectorAll('.open-modal')
    this.closeButton = document.getElementById('close-modal')
    this.titleInput = document.getElementById('form-input-title')
  }

  watchButtons() {
    this.watchOpenButtons()
    this.watchCloseButton()
    this.watchBackdrop()
  }

  watchOpenButtons() {
    this.openButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        this.modal.classList.add('display-flex')

        // For some reason the 'autofocus' HTML property doesn't work.
        this.titleInput.focus()
      })
    })
  }

  watchCloseButton() {
    this.closeButton.addEventListener('click', (event) => {
      this.closeModal()
    })
  }

  watchBackdrop() {
    this.backdrop.addEventListener('click', (event) => {
      this.closeModal()
    })
  }

  closeModal() {
    return this.modal.classList.remove('display-flex')
  }
}

new App().start()
