const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
const dataPanel = document.querySelector('#data-panel')

axios
  .get(INDEX_URL)
  .then(response => {
    movies.push(...response.data.results)
    renderMoviesList(movies)
  })
  .catch(err => console.log(err))


function renderMoviesList(data) {
  let htmlContent = ''
  data.forEach(item => {
    htmlContent += `
              <div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img
          src="${POSTER_URL + item.image}"
          class="card-img-top"
          alt="Movie Poster"
        />
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button
            class="btn btn-primary btn-show-movie"
            data-bs-toggle="modal"
            data-bs-target="#movie-modal"
            data-id=${item.id}
          >
            More
          </button>
          <button class="btn btn-success btn-add-favorite">+</button>
        </div>
      </div>
    </div>
  </div>
        `
  })
  dataPanel.innerHTML = htmlContent
}

function showMovieModel(id) {
  const modelTitle = document.querySelector('#movie-modal-title')
  const modelImg = document.querySelector('#movie-modal-image')
  const modelDate = document.querySelector('#movie-modal-date')
  const modelDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then(response => {
    const data = response.data.results
    modelTitle.textContent = data.title
    modelImg.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
    modelDate.textContent = `Release date: ${data.release_date}`
    modelDescription.textContent = data.description
  }).catch(err => {
    console.log(err)
  })
}

dataPanel.addEventListener('click', function onPanelClicked(e) {
  if (e.target.matches('.btn-show-movie')) {
    console.log(e.target)
    console.log(e.target.dataset.id)
    showMovieModel(e.target.dataset.id)
  }
})

